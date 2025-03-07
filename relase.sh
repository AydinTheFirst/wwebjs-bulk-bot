# relase.sh

# Executables: wwebjs-bulk-bot-linux, wwebjs-bulk-bot-macos, wwebjs-bulk-bot-win.exe
# Public: public
# zip each executable with public folder

# Usage: ./release.sh

# cd into output
cd output

# Check if executables exist
if [ ! -f wwebjs-bulk-bot-linux ] || [ ! -f wwebjs-bulk-bot-macos ] || [ ! -f wwebjs-bulk-bot-win.exe ]; then
  echo "Executables not found"
  exit 1
fi

# Check if public folder exists
if [ ! -d public ]; then
  echo "Public folder not found"
  exit 1
fi

# Zip executables with public folder
zip -r wwebjs-bulk-bot-linux.zip wwebjs-bulk-bot-linux public

zip -r wwebjs-bulk-bot-macos.zip wwebjs-bulk-bot-macos public

zip -r wwebjs-bulk-bot-win.zip wwebjs-bulk-bot-win.exe public

# remove executables
rm wwebjs-bulk-bot-linux
rm wwebjs-bulk-bot-macos
rm wwebjs-bulk-bot-win.exe

echo "Release complete"

exit 0


