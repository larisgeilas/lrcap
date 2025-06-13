import os
import shutil
import sys

def copy_tree(src, dst):
    if not os.path.exists(src):
        print(f"Source folder does not exist: {src}")
        return False

    os.makedirs(dst, exist_ok=True)

    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            copy_tree(s, d)
        else:
            shutil.copy2(s, d)
    return True

def main():
    cwd = os.path.abspath(os.path.dirname(__file__))
    external_src = os.path.abspath(os.path.join(cwd, '../lrcap-reports/output'))
    target_dir = os.path.abspath(os.path.join(cwd, 'themes/hugoplate/assets/reports-widgets-data'))

    if not os.path.exists(external_src):
        print(f"❌ Source directory does not exist: {external_src}")
        sys.exit(1)

    print(f"Copying from {external_src} to {target_dir} ...")
    success = copy_tree(external_src, target_dir)

    if success:
        print("✅ Copy completed successfully.")
    else:
        print("❌ Copy failed.")

if __name__ == "__main__":
    main()
