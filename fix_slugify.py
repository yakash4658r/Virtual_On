import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('64.227.128.93', username='root', password='ithuInterncraft12odadroplet')

# Append python-slugify to the file
stdin, stdout, stderr = ssh.exec_command("echo 'python-slugify>=8.0.1' >> ~/Virtual_On/backend/requirements.txt")
print('APPENDED:', stdout.read().decode())

# Print out the file to make sure it's there
stdin, stdout, stderr = ssh.exec_command("cat ~/Virtual_On/backend/requirements.txt")
print('REQS:', stdout.read().decode())

# Now run rebuild in background
cmd = "cd ~/Virtual_On && nohup sh -c 'docker-compose build --no-cache backend && docker-compose up -d backend' > build3.log 2>&1 &"
stdin, stdout, stderr = ssh.exec_command(cmd)
print('REBUILDING STARTED!')

ssh.close()
