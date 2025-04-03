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
        
class AccountController:
    session_list = []

    @staticmethod
    def login_prompt():
        email = input("Enter an email: ")
        password = input("Enter a password: ")
        
        sesString = AccountController.login(email, password)
        
        print("Created new session: " + sesString)
        
    @staticmethod
    def login(_email, _password):
        if Credentials.verify_email(_email) == None:
            print("Invalid email.")
            return "NULL"
            
        email_hash = hashlib.sha512(_email.encode("utf-8")).hexdigest()
        for existing_session in AccountController.session_list:
            if existing_session.get_credentials().get_email_hash() == email_hash:
                print("A user with this email is already signed in.")
                return "NULL"
    
        external_ip = urllib.request.urlopen('https://ident.me').read().decode('utf8')
        password_hash = hashlib.sha512(_password.encode("utf-8")).hexdigest()
        ip_hash = hashlib.sha512(external_ip.encode("utf-8")).hexdigest()
        
        cred = Credentials(email_hash, password_hash, ip_hash)
        ses = SessionToken(cred, "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0", int(time.time()))
        AccountController.session_list.append(ses)
        
        return ses.__str__()
    
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