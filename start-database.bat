@echo off
REM GoFreeHold - Start local MariaDB (portable, no admin required)
REM Keep this window open while working on the project.
echo Starting MariaDB on port 3306...
"E:\mariadb-portable\mariadb-12.3.2-winx64\bin\mysqld.exe" --datadir="E:\mariadb-portable\data" --port=3306 --console --innodb-buffer-pool-size=64M --max-connections=30 --performance-schema=OFF
