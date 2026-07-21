import paramiko
import time

host = '64.227.128.93'
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect(host, username='root', password='ithuInterncraft12odadroplet')

# Step 1: Set postgres password via local socket (trust auth works here)
print("=== Setting postgres password ===")
_, stdout, _ = ssh.exec_command(
    "cd /root/Virtual_On && docker-compose exec -T postgres psql -U postgres -c \"ALTER USER postgres WITH PASSWORD 'postgres';\" 2>&1"
)
print(stdout.read().decode('utf-8', errors='replace'))

time.sleep(2)

# Step 2: Run migrations with the correct DATABASE_URL
print("\n=== Running migrations ===")
_, stdout, _ = ssh.exec_command(
    'cd /root/Virtual_On && docker-compose exec -T backend alembic upgrade head 2>&1',
    timeout=120
)
out = stdout.read().decode('utf-8', errors='replace')
# Print only last relevant lines
lines = out.strip().split('\n')
for line in lines[-20:]:
    print(line)

# Step 3: Check if migration succeeded
print("\n=== Migration status ===")
_, stdout, _ = ssh.exec_command(
    "cd /root/Virtual_On && docker-compose exec -T postgres psql -U postgres -d saree_mirror -c \"SELECT version_num FROM alembic_version;\" 2>&1"
)
print(stdout.read().decode('utf-8', errors='replace'))

# Step 4: Run seed
print("\n=== Seeding ===")
_, stdout, _ = ssh.exec_command(
    'cd /root/Virtual_On && docker-compose exec -T backend python seed.py 2>&1'
)
print(stdout.read().decode('utf-8', errors='replace'))

ssh.close()
print("=== Done ===")
