import paramiko
import os

host = '64.227.128.93'
user = 'root'
password = 'ithuInterncraft12odadroplet'
remote_base = '/root/Virtual_On'
local_base = 'r:/Ragava_virtual/saree-virtual-tryon'

files_to_sync = [
    # Backend - AI & Core
    'backend/ai/replicate_client.py',
    'backend/routers/kiosk.py',
    'backend/routers/store.py',
    'backend/schemas/product.py',
    # Backend - Models & Migration
    'backend/models/tryon.py',
    'backend/models/__init__.py',
    'backend/schemas/kiosk.py',
    'backend/main.py',
    'backend/migrations/versions/3450c91f8b48_add_customer_session_models.py',
    # Frontend - Kiosk screens (all polished)
    'frontend/src/App.jsx',
    'frontend/src/api/kioskAPI.js',
    'frontend/src/store/kioskStore.js',
    'frontend/src/hooks/useKioskMode.js',
    'frontend/src/hooks/useIdleTimer.js',
    'frontend/src/styles/kiosk.css',
    'frontend/src/pages/kiosk/KioskLayout.jsx',
    'frontend/src/pages/kiosk/KioskWelcomeScreen.jsx',
    'frontend/src/pages/kiosk/KioskCameraScreen.jsx',
    'frontend/src/pages/kiosk/KioskTryOnScreen.jsx',
    'frontend/src/pages/kiosk/KioskSummaryScreen.jsx',
    'frontend/src/pages/kiosk/CompareModal.jsx',
    # Frontend - Admin Dashboard 
    'frontend/src/pages/admin/DashboardPage.jsx',
    'frontend/src/pages/admin/DashboardPage.css',
    # Frontend - package for npm install
    'frontend/package.json',
    'frontend/package-lock.json',
]

def create_ssh_client():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(host, username=user, password=password)
    return ssh

try:
    print("Connecting to VPS...")
    ssh = create_ssh_client()
    
    sftp = ssh.open_sftp()
    for f in files_to_sync:
        local_path = os.path.join(local_base, f).replace('\\', '/')
        remote_path = f"{remote_base}/{f}"
        remote_dir = os.path.dirname(remote_path)
        
        # Ensure remote dir exists
        try:
            sftp.stat(remote_dir)
        except FileNotFoundError:
            ssh.exec_command(f"mkdir -p {remote_dir}")
        
        print(f"  >> {f}")
        sftp.put(local_path, remote_path)
    sftp.close()
    
    print("\nAll files uploaded!")
    
    # Full rebuild
    cmd = f"""cd {remote_base} && \
docker-compose down && \
docker-compose build backend celery_worker frontend && \
docker-compose up -d && \
sleep 5 && \
docker-compose exec -T backend alembic upgrade head && \
docker-compose exec -T backend python seed.py
"""
    print("Running full rebuild on VPS...")
    stdin, stdout, stderr = ssh.exec_command(cmd)
    
    exit_status = stdout.channel.recv_exit_status()
    import sys
    sys.stdout.buffer.write(b"STDOUT: " + stdout.read() + b"\n")
    sys.stdout.buffer.write(b"STDERR: " + stderr.read() + b"\n")
    print(f"\nDeploy {'SUCCESS' if exit_status == 0 else 'FAILED'} (exit {exit_status})")
    
finally:
    ssh.close()
