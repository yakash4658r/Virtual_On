import paramiko
import time

host = '64.227.128.93'
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username='root', password='ithuInterncraft12odadroplet')

# Check how alembic env.py reads the DB URL
print("=== alembic env.py ===")
_, stdout, _ = ssh.exec_command('cat /root/Virtual_On/backend/migrations/env.py')
print(stdout.read().decode('utf-8', errors='replace'))

# Check core/config.py to understand settings
print("\n=== core/config.py ===")
_, stdout, _ = ssh.exec_command('cat /root/Virtual_On/backend/core/config.py')
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
