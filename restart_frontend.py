import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('64.227.128.93', username='root', password='ithuInterncraft12odadroplet')

print('Removing old frontend containers...')
# Remove ANY container that has virtualon_frontend in its name
stdin, stdout, stderr = ssh.exec_command("docker ps -a | grep virtualon_frontend | awk '{print $1}' | xargs -r docker rm -f")
print(stdout.read().decode('utf-8', errors='ignore'))
print(stderr.read().decode('utf-8', errors='ignore'))

print('Building and starting frontend...')
stdin, stdout, stderr = ssh.exec_command('cd ~/Virtual_On && docker-compose build frontend && docker-compose up -d frontend')

# Read output carefully to avoid encode errors
out = stdout.read().decode('utf-8', errors='ignore')
err = stderr.read().decode('utf-8', errors='ignore')

# print to a file instead of stdout to avoid charmap errors
with open('rebuild_output.txt', 'w', encoding='utf-8') as f:
    f.write("STDOUT:\n")
    f.write(out)
    f.write("\nSTDERR:\n")
    f.write(err)

print("Done. Wrote output to rebuild_output.txt")
ssh.close()
