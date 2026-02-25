import os
import subprocess
import shutil

if os.path.exists("package.json"):
    os.remove("package.json")

print("Running create-next-app with skip-install...")
subprocess.run('cmd.exe /c "npx -y create-next-app@latest temp-app2 --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install --yes"', shell=True)

print("Moving files to root...")
if os.path.exists("temp-app2"):
    for item in os.listdir("temp-app2"):
        src = os.path.join("temp-app2", item)
        dst = os.path.join(".", item)
        if os.path.exists(dst):
            if os.path.isdir(dst):
                shutil.rmtree(dst)
            else:
                os.remove(dst)
        shutil.move(src, ".")
    os.rmdir("temp-app2")
print("Done!")
