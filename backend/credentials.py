import base64
import hashlib
import re

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
        
        return base64.b64encode(m.digest()).decode("utf-8").replace('/', '_')
        
    def __eq__(self, other):
        if isinstance(other, str):
            return self.__str__() == other
        else:
            return False