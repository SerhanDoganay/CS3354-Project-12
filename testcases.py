from logout import AccountController

if __name__ == "__main__":
    # Logout input: session key
    # Valid - the session key of a logged-in user
    # Invalid - anything else - the input will be parsed as a string no matter what
    
    ses1 = AccountController.login("valid@email.com", "istilldon'tcareaboutthepassword")
    
    all_cases_passed = True
    
    if (AccountController.login("fakeemail", "idcaboutthepassword") != "NULL"):
        print("Test case 1 failed")
        all_cases_passed = False
    if (ses1 == "NULL"):
        print("Test case 2 failed")
        all_cases_passed = False
    if (AccountController.logout("fakesessionkey")):
        print("Test case 3 failed")
        all_cases_passed = False
    if (not AccountController.logout(ses1)):
        print("Test case 4 failed")
        all_cases_passed = False
        
    if (all_cases_passed):
        print("All test cases passed")