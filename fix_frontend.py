import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('64.227.128.93', username='root', password='ithuInterncraft12odadroplet')
sftp = ssh.open_sftp()

local_path = 'frontend/src/pages/admin/SessionGalleryPage.jsx'
remote_path = '/root/Virtual_On/frontend/src/pages/admin/SessionGalleryPage.jsx'
sftp.put(local_path, remote_path)
print(f'Uploaded {local_path} to {remote_path}')
sftp.close()

print('Removing old frontend containers...')
ssh.exec_command("docker ps -a | grep virtualon_frontend | awk '{print $1}' | xargs -r docker rm -f")

print('Building and starting frontend...')
stdin, stdout, stderr = ssh.exec_command('cd ~/Virtual_On && docker-compose build frontend && docker-compose up -d frontend')

out = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')

with open('rebuild_output2.txt', 'w', encoding='utf-8') as f:
    f.write("STDOUT:\n")
    f.write(out)
    f.write("\nSTDERR:\n")
    f.write(err)

print("Done. Wrote output to rebuild_output2.txt")
ssh.close()
