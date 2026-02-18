
import os
import subprocess

def add_env_vars():
    env_file = ".env"
    if not os.path.exists(env_file):
        print(f"{env_file} not found!")
        return

    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            
            try:
                key, val = line.split("=", 1)
                val = val.strip('"\'')
                print(f"Adding env var: {key}")
                
                # Check if var exists first? No, easier to try add
                # If it fails, we assume it exists
                subprocess.run(
                    ["npx", "vercel", "env", "add", key, "production"],
                    input=val.encode(),
                    capture_output=True # silence output to avoid leaking? Or maybe show stderr
                ) 
            except ValueError:
                continue

if __name__ == "__main__":
    add_env_vars()
