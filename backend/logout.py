import base64
from credentials import Credentials, SessionToken
from database import DatabaseManager
import hashlib
import sys
import time
import urllib.request

class LoginUser:
    MIN_LENGTH_LOGIN_ID = 8
    MAX_LENGTH_LOGIN_ID = 20
    existingIDs = ["abc@abcdef.com", "def@abcdef.org", "ghi@abcdef.gov", "olduser@hmail.com"]
    badChars = [' ', ',', '/', '\\']

    @staticmethod
    def checkLoginLength(argLoginID):
        return LoginUser.MIN_LENGTH_LOGIN_ID <= len(argLoginID) <= LoginUser.MAX_LENGTH_LOGIN_ID

    @staticmethod
    def checkLoginExisting(argLoginID):
        return argLoginID in LoginUser.existingIDs

    @staticmethod
    def checkLoginForBadCharacters(argLoginID):
        for bc in LoginUser.badChars:
            if bc in argLoginID:
                return True
        for c in argLoginID:
            if ord(c) < 32:
                return True
        return False

    @staticmethod
    def validate_login_id(argLoginID):
        #if not LoginUser.checkLoginLength(argLoginID):
        #    return "Login id does not satisfy length requirement"
        if LoginUser.checkLoginExisting(argLoginID):
            return "Login id exists !!!"
        if LoginUser.checkLoginForBadCharacters(argLoginID):
            return "Login id has space/control/special character in it"
        return "Login Successful"

class PasswordValidator:
    @staticmethod
    def validate_password(password):
        if not isinstance(password, str):
            return "Password must be a string"
    
        if len(password) < 8:
            return "Password must be at least 8 characters in length"

        if ' ' in password:
            return "Password cannot contain spaces"

        for c in password:
            if ord(c) < 32:
                return "Password cannot contain control characters"

        return "Password OK"
        
class AccountController:
    @staticmethod
    def login_prompt():
        email = input("Enter an email: ")
        password = input("Enter a password: ")
        password2 = input("Re-enter password: ")
        
        sesString = AccountController.login(email, password, password2)
        
        print("Created new session: " + sesString)
    
    @staticmethod
    def signup(email, password, password2):
        if LoginUser.checkLoginExisting(email):
            print("Email already exists")
            return "NULL"

        if Credentials.verify_email(email) is None:
            print("Invalid email format")
            return "NULL"

        if password != password2:
            print("Passwords do not match")
            return "NULL"

        pwd_result = PasswordValidator.validate_password(password)
        if pwd_result != "Password OK":
            print(pwd_result)
            return "NULL"

        email_hash = hashlib.sha512(email.encode("utf-8")).hexdigest()
        password_hash = hashlib.sha512(password.encode("utf-8")).hexdigest()

        # Save the user in the DB
        if not DatabaseManager.add_user(email_hash, password_hash):
            print("User already exists in DB")
            return "NULL"

        print("Signup successful for:", email)
        return "OK"

        
    @staticmethod
    def login(_username, _password):
        # Step 1: Validate the username (assuming you have a method for this)
        validation_result = LoginUser.validate_login_id(_username)
        if validation_result != "Login Successful":
            print(validation_result)
            return "NULL"

        # Step 2: Validate the password
        pwd_result = PasswordValidator.validate_password(_password)
        if pwd_result != "Password OK":
            print(pwd_result)
            return "NULL"

        # Step 3: Hash the username to use as the identifier
        username_hash = hashlib.sha512(_username.encode("utf-8")).hexdigest()

        # Step 4: Verify if the username exists in the database
        if not DatabaseManager.user_exists(username_hash):
            print("Username does not exist.")
            return "NULL"

        # Step 5: Hash the provided password and verify it
        password_hash = hashlib.sha512(_password.encode("utf-8")).hexdigest()

        # Step 6: Retrieve the stored password hash for comparison (assuming you store the password hash)
        stored_password_hash = DatabaseManager.get_password_hash(username_hash)
        if stored_password_hash != password_hash:
            print("Incorrect password.")
            return "NULL"

        # Step 7: Generate session token
        external_ip = "127.0.0.1"  # Normally, you'd fetch the user's real IP here
        ip_hash = hashlib.sha512(external_ip.encode("utf-8")).hexdigest()

        # Create a credentials object with username hash and password hash
        cred = Credentials(username_hash, password_hash, ip_hash)
        ses = SessionToken(cred, "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0", int(time.time()))
        
        # Save session token in the database
        DatabaseManager.add_session(ses)

        # Return the session token as a string
        return str(ses)

    
    @staticmethod
    def logout_prompt():
        testses = input("Enter the token for a session that is signed in: ")
        AccountController.logout(testses)
        
    @staticmethod
    def logout(sesString):
        if not isinstance(sesString, str):
            print("sesString must be a string.")
            return False
    
        if DatabaseManager.remove_session(sesString):
            print("Successfully signed out.")
            return True
        
        print("No such user is signed in.")
        return False

if __name__ == "__main__":
    while True:
        op = input("Enter 1 to login, enter 2 to log out, or enter anything else to quit: ")
        if op == "1":
            AccountController.login_prompt()
        elif op == "2":
            AccountController.logout_prompt()
        else:
            sys.exit(0)
