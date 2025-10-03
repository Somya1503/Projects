import cv2
from cvzone.HandTrackingModule import HandDetector
import pyautogui

cam = cv2.VideoCapture(0)
cam.set(3, 640)
cam.set(4, 480)

detector = HandDetector(detectionCon=0.7, maxHands=2)

rightPressed = False
leftPressed = False

while True:
    success, img = cam.read()
    if not success:
        print("❌ Cannot read from camera.")
        break

    img = cv2.flip(img, 1)
    hands, img = detector.findHands(img)

    # Reset flags every frame; we'll set them based on hand detection
    rightPressedThisFrame = False
    leftPressedThisFrame = False

    if hands:
        for hand in hands:
            fingers = detector.fingersUp(hand)
            totalFingers = fingers.count(1)
            handType = hand['type']

            cv2.putText(img, f'{handType} Fingers: {totalFingers}', (10, 30 if handType=="Right" else 70),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            if handType == "Right":
                # Accelerate with right hand 5 fingers
                if totalFingers == 5:
                    rightPressedThisFrame = True

            elif handType == "Left":
                # Brake with left hand 0 fingers
                if totalFingers == 0:
                    leftPressedThisFrame = True

    # Handle right arrow key (accelerate)
    if rightPressedThisFrame and not rightPressed:
        pyautogui.keyDown('right')
        rightPressed = True
        print("➡ Accelerate ON")
    elif not rightPressedThisFrame and rightPressed:
        pyautogui.keyUp('right')
        rightPressed = False
        print("➡ Accelerate OFF")

    # Handle left arrow key (brake)
    if leftPressedThisFrame and not leftPressed:
        pyautogui.keyDown('left')
        leftPressed = True
        print("⬅ Brake ON")
    elif not leftPressedThisFrame and leftPressed:
        pyautogui.keyUp('left')
        leftPressed = False
        print("⬅ Brake OFF")

    # Show the camera feed
    cv2.imshow("Hill Climb Dual-Hand Control", img)

    if cv2.waitKey(1) & 0xFF == ord('q'):
        print("Quitting...")
        break

cam.release()
cv2.destroyAllWindows()
