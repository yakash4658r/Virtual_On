import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('64.227.128.93', username='root', password='ithuInterncraft12odadroplet')
stdin, stdout, stderr = ssh.exec_command('docker-compose -f /root/Virtual_On/docker-compose.yml exec -T postgres psql -U postgres -d saree_mirror -c "SELECT id, device_id, store_id FROM devices;"')
print(stdout.read().decode('utf-8', errors='ignore'))
print(stderr.read().decode('utf-8', errors='ignore'))
