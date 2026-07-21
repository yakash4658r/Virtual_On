import paramiko
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('64.227.128.93', username='root', password='ithuInterncraft12odadroplet')

cmd = "cd ~/Virtual_On && git pull origin main && nohup sh -c 'docker-compose build --no-cache && docker-compose up -d' > build2.log 2>&1 &"
stdin, stdout, stderr = ssh.exec_command(cmd)
print('Command launched in background on VPS!')
ssh.close()
