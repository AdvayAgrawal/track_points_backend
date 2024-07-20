import re
import mysql.connector

mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Vijay197#",
    database="track_points_app"
)


mycursor = mydb.cursor()
data = """18/06: ABBC- 10 pts
19/06: ABBBB- 11 pts
20/06: ACE- 8 pts
21/06: 0 pts
22/06: 0 pts
23/06: 0 pts
24/06: ABBBC- 12 pts
25/06: ABBC- 10 pts
26/06: BC- 5 pts
27/06: B- 2 pts
28/06: 0 pts
29/06: 0 pts
30/06: 0 pts
1/07: ABBC- 10 pts
2/07: 0 pts
3/07: A- 3 pts
4/07: C- 3pts
5/07: 0pts
6/07: 0 pts
7/07: 0 pts
8/07: ABC- 8 pts
9/07: ABC- 8 pts
10/07: ABC- 8 pts
11/07: AC- 6pts
12/07: C- 3pts
13/07: 0 pts
14/07: 0 pts
15/07: 0 pts
16/07: BC- 5 pts"""

data = data.splitlines()
new_data = []

print(len(data))
#start date: 17/06/2024
i = 1
for line in data:
    splitline = re.split(":|-", line)
    
    splitline[0] = i
    i +=1

    points = int(splitline[-1][:-3])
    splitline[-1] = points
    if len(splitline) == 2:
        temp = splitline[1]
        splitline[1] = ''
        splitline.append(temp)
    splitline[1] = splitline[1].strip()
    new_data.append(splitline)
    sql = f'INSERT INTO track_points VALUES ({splitline[0]}, "{splitline[1]}", {splitline[2]})'
    print(sql)
    mycursor.execute(sql)
    print('done')

res = input("Confirm changes? (y/n)")

if res == 'y' or res == "Y":
    mydb.commit()
    print("changes committed")
else:
    mydb.rollback()
    print("exiting")


