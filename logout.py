import base64
import hashlib
import re
import sys
import time
import urllib.request

class Credentials:
    def __init__(self, email, pw, ip):
        self.email_hash = email
        self.password_hash = pw
        self.ip_hash = ip
        
    def get_email_hash(self):
        return self.email_hash
        
    def __bytes__(self):
        ret = self.email_hash + self.password_hash + self.ip_hash
        return ret.encode("utf-8")
        
    @staticmethod
    def verify_email(email):
        return re.match(r"^.+@.+\..+$", email)
        
    #@staticmethod
    #def verify_password(password):
        #return True # I'm just logging out; no point validating a password

class SessionToken:
    def __init__(self, hash_coll, ua, ts):
        self.raw_credentials = hash_coll
        self.credentials = bytes(hash_coll)
        self.user_agent = ua.encode("utf-8")
        self.timestamp = ts.to_bytes(8, "little")
        
    def get_credentials(self):
        return self.raw_credentials
        
    def __str__(self):
        m = hashlib.sha512()
    
        m.update(self.credentials)
        m.update(self.user_agent)
        m.update(self.timestamp)
        
        return base64.b64encode(m.digest()).decode("utf-8")
        
    def __eq__(self, other):
        if isinstance(other, str):
            return self.__str__() == other
        else:
            return False

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
    session_list = []

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
        for existing_session in AccountController.session_list:
            if existing_session.get_credentials().get_email_hash() == email_hash:
                print("A user with this email is already signed in.")
                return "NULL"

        external_ip = "127.0.0.1"  # For demonstration, skip real IP fetch
        password_hash = hashlib.sha512(_password.encode("utf-8")).hexdigest()
        ip_hash = hashlib.sha512(external_ip.encode("utf-8")).hexdigest()
        
        cred = Credentials(email_hash, password_hash, ip_hash)
        ses = SessionToken(cred, "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0", int(time.time()))
        AccountController.session_list.append(ses)
        
        return str(ses)
    
    @staticmethod
    def logout_prompt():
        testses = input("Enter the token for a session that is signed in: ")
        AccountController.logout(testses)
        
    @staticmethod
    def logout(sesString):
        for existing_session in AccountController.session_list:
            if existing_session == sesString:
                AccountController.session_list.remove(existing_session)
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
