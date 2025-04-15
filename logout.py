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
    def login(_email, _password, _password2):
        validation_result = LoginUser.validate_login_id(_email)
        if validation_result != "Login Successful":
            print(validation_result)
            return "NULL"

        if Credentials.verify_email(_email) is None:
            print("Invalid email format.")
            return "NULL"

        pwd_result = PasswordValidator.validate_password(_password)
        if pwd_result != "Password OK":
            print(pwd_result)
            return "NULL"
        
        pwd_result_2 = PasswordValidator.validate_password(_password2)
        if pwd_result_2 != "Password OK":
            print(pwd_result_2)
            return "NULL"
            
        if _password != _password2:
            print("Retyped password does not match original password")
            return "NULL"

        email_hash = hashlib.sha512(_email.encode("utf-8")).hexdigest()
        if DatabaseManager.has_email(email_hash):
            print("A user with this email is already signed in.")
            return "NULL"    

        external_ip = "127.0.0.1"  # For demonstration, skip real IP fetch
        password_hash = hashlib.sha512(_password.encode("utf-8")).hexdigest()
        ip_hash = hashlib.sha512(external_ip.encode("utf-8")).hexdigest()
        
        cred = Credentials(email_hash, password_hash, ip_hash)
        ses = SessionToken(cred, "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0", int(time.time()))
        DatabaseManager.add_session(ses)
        
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
