import {
  Accordion,
  AccordionItem,
  Button,
  getKeyValue,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Pagination,
  Selection,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tabs,
  Textarea,
  User,
} from "@heroui/react";
import exceljs from "exceljs";
import { QRCodeCanvas } from "qrcode.react";
import React, { useEffect } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import http from "@/http";
import { useUsers } from "@/providers/UsersProvider";
import { User as UserType, WhatsAppWeb } from "@/types";
import { LucideCheckCircle, LucideTrash, LucideXCircle } from "lucide-react";
import { getItemsFromSelection } from "@/utils";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const { data: qr } = useSWR<{ value: string }>("/wp/qr", {});
  const { data: auth } = useSWR<WhatsAppWeb.ClientInfo>("/wp/auth", {});
  const { users, selectedUsers } = useUsers();

  useEffect(() => {
    if (!auth) return;
    setIsAuthenticated(true);
  }, [auth]);

  const logout = async () => {
    try {
      await http.post("/wp/logout");
      toast.success("Çıkış yapıldı.");
      location.reload();
    } catch (error) {
      http.handleError(error);
    }
  };

  return (
    <div className="container grid min-h-screen max-w-xl place-items-center">
      <Accordion variant="shadow">
        <AccordionItem
          title="Yetkilendirme"
          startContent={
            auth ? (
              <LucideCheckCircle className="text-green-500" />
            ) : (
              <LucideXCircle className="text-red-500" />
            )
          }
        >
          {auth && (
            <div className="flex items-center justify-between gap-3">
              <User description={auth.wid?.user} name={auth.pushname} />
              <Button color="danger" onPress={logout}>
                Çıkış Yap
              </Button>
            </div>
          )}
          {qr && !auth && (
            <div className="grid place-items-center">
              <QRCodeCanvas marginSize={4} size={256} value={qr.value} />
            </div>
          )}
        </AccordionItem>
        <AccordionItem
          isDisabled={!isAuthenticated}
          title={`Kişiler (${selectedUsers.length}/${users.length})`}
        >
          <div className="grid gap-3">
            <UsersTable />
            <ImportUsersModal />
          </div>
        </AccordionItem>
        <AccordionItem isDisabled={!isAuthenticated} title="Mesaj Gönder">
          <SendMessage />
        </AccordionItem>
      </Accordion>
    </div>
  );
}

const SendMessage = () => {
  const { selectedUsers } = useUsers();
  const [message, setMessage] = React.useState("");

  const handleSend = async () => {
    if (!message) return toast.error("Mesaj boş olamaz.");
    if (selectedUsers.length === 0) return toast.error("Kişi seçilmedi.");

    try {
      await http.post("/wp/send", {
        message,
        users: selectedUsers,
      });

      toast.success("Mesaj gönderildi.");
    } catch (error) {
      http.handleError(error);
    }
  };

  return (
    <form className="grid gap-3" onSubmit={(event) => event.preventDefault()}>
      <Textarea
        isRequired
        label="Mesaj"
        name="message"
        onValueChange={setMessage}
        value={message}
      />
      <Button color="primary" fullWidth onPress={handleSend}>
        Gönder
      </Button>
    </form>
  );
};

const UsersTable = () => {
  const rowsPerPage = 10;

  const { users, setUsers, setSelectedUsers } = useUsers();
  const [page, setPage] = React.useState(1);
  const [selectedItems, setSelectedItems] = React.useState<Selection>();

  const pages = Math.ceil(users.length / rowsPerPage);

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "phone", label: "Phone" },
    { key: "actions", label: "#" },
  ];

  const rows = users.map((user) => ({
    key: user.phone,
    ...user,
  }));

  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return rows.slice(start, end);
  }, [rows]);

  const selection = React.useMemo(() => {
    const selected = getItemsFromSelection(rows, selectedItems);
    setSelectedUsers(selected);
    return selected;
  }, [selectedItems]);

  const handleDelete = (phone: string) => {
    const filtered = users.filter((user) => user.phone !== phone);
    setUsers(filtered);
  };

  const handleDeleteSelected = () => {
    const items = getItemsFromSelection(rows, selectedItems);
    const phones = items.map((item) => item.phone);

    const filtered = users.filter((user) => !phones.includes(user.phone));
    setUsers(filtered);
  };

  return (
    <div className="grid gap-3">
      <div className="flex justify-end">
        <Button
          color="danger"
          isDisabled={selection.length === 0}
          onPress={handleDeleteSelected}
        >
          {selection.length} Kişiyi Sil
        </Button>
      </div>
      <Table
        aria-label="Example table with dynamic content"
        bottomContent={
          <Pagination
            total={pages}
            onChange={setPage}
            className="mx-auto"
            color="primary"
          />
        }
        isStriped
        selectionMode="multiple"
        selectedKeys={selectedItems}
        onSelectionChange={setSelectedItems}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>
        <TableBody emptyContent="Kişi Bulunamadı" items={items}>
          {(item) => (
            <TableRow key={item.key}>
              <TableCell>{getKeyValue(item, "firstName")}</TableCell>
              <TableCell>{getKeyValue(item, "lastName")}</TableCell>
              <TableCell>{getKeyValue(item, "phone")}</TableCell>
              <TableCell>
                <Button
                  onPress={() => handleDelete(item.phone)}
                  color="danger"
                  size="sm"
                  isIconOnly
                >
                  <LucideTrash size={16} />
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

const ImportUsersModal = () => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const { setUsers } = useUsers();

  const handleManuelSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget),
      data: Record<string, string> = Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => [
          key,
          value.toString(),
        ]),
      );

    if (data["phone"].toString().length !== 10) {
      toast.error("Telefon numarası 10 haneli olmalıdır.");
      return;
    }

    data["phone"] = `90${data["phone"]}`;

    setUsers((prev) => [...prev, data as unknown as UserType]);
    toast.success("Kişi eklendi.");

    setIsModalOpen(false);
  };

  const handleFileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget),
      file = formData.get("file") as File;

    if (!file) {
      toast.error("Dosya seçilmedi.");
      return;
    }

    const reader = new FileReader(),
      workbook = new exceljs.Workbook();

    reader.onload = async (event) => {
      const buffer = event.target?.result as ArrayBuffer,
        data = new Uint8Array(buffer);

      await workbook.xlsx.load(data);

      const worksheet = workbook.getWorksheet(1);
      if (!worksheet) return toast.error("Dosya içeriği okunamadı.");

      const rows = worksheet.getRows(2, worksheet.rowCount);

      if (!rows) return toast.error("Kişi bulunamadı.");

      const users: UserType[] = [];

      for (const row of rows) {
        const [firstName, lastName, phone] = [
          row.getCell(1).value?.toString(),
          row.getCell(2).value?.toString(),
          row.getCell(3).value?.toString(),
        ];

        if (!firstName || !lastName || !phone) continue;

        if (!phone.startsWith("90")) continue;

        users.push({
          firstName,
          lastName,
          phone,
        });
      }

      setUsers(users);
      toast.success("Kişiler eklendi.");
      setIsModalOpen(false);
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <>
      <Button onPress={() => setIsModalOpen(true)}>Kişi Ekle</Button>
      <Modal isOpen={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Kişi Ekle</ModalHeader>
          <ModalBody>
            <Tabs fullWidth>
              <Tab key="manuel" title="Manuel">
                <form className="grid gap-3" onSubmit={handleManuelSubmit}>
                  <Input isRequired label="İsim" name="firstName" />
                  <Input isRequired label="Soyisim" name="lastName" />
                  <Input
                    description="Telefon numarası başında sıfır olmadan girilmelidir."
                    isRequired
                    label="Telefon"
                    name="phone"
                  />
                  <Button color="primary" fullWidth type="submit">
                    Ekle
                  </Button>
                </form>
              </Tab>
              <Tab key="file" title="Dosya">
                <form className="grid gap-3" onSubmit={handleFileSubmit}>
                  <Input
                    accept=".xlsx"
                    isRequired
                    label="Dosya"
                    name="file"
                    type="file"
                  />
                  <Button color="primary" fullWidth type="submit">
                    Ekle
                  </Button>
                </form>
              </Tab>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
