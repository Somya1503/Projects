'''
1 for sanke
-1 for water 
0 for gun
'''
import random 
youstr=input("Enter your choice :")
dict={"s":1,"w":-1,"g":0}
you=dict[youstr]
computer=random.choice([1, 0, -1])
reversedict={1:"Snake",-1:"Water",0:"Gun"}
print(f"You choose:{reversedict[you]}\tComputer choose :{reversedict[computer]} ")
# if(computer==you):
#     print("It's a draw !")
# else:
#     if(you==1 and computer==-1):#2
#         print("You Win !")
#     elif(you==1 and computer==0):#1
#         print("You Lose !")
#     elif(you==0 and computer==-1):#1
#         print("You Lose !")
#     elif(you==0 and computer==1):#-1
#         print("You Win !")
#     elif(you==-1 and computer==1):#-2
#         print("You Lose !")
#     elif(you==-1 and computer==0):#-1
#         print("You Win !")
#     else:
#         print("Something went wrong")

if((you-computer)==2 or (you-computer)==-1):
    print("You win !")
elif((you-computer)==0):
    print("It's a draw !")
else:
    print("You lose !")
    

