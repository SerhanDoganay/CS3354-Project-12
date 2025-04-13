import firebase_admin
from firebase_admin import db, credentials

class DatabaseManager:
    initialized = False

    @staticmethod
    def firebase_init():
        if not DatabaseManager.initialized:
            cred = credentials.Certificate("private/firebase.json")
            firebase_admin.initialize_app(cred, { "databaseURL": "https://betterchefai-default-rtdb.firebaseio.com/" })
            DatabaseManager.initialized = True
    
    @staticmethod
    def add_session():
        DatabaseManager.firebase_init()

        sessions_ref = db.reference("/sessions")
        sessions_data = sessions_ref.get()
        
        session_count_ref = sessions_ref.child("count")
        
        # Does the "sessions" field even exist?
        if sessions_data is None:
            # Initialize data
            session_count_ref.set(0)
            
        # Increment the session count
        session_count = session_count_ref.get()
        session_count += 1
        session_count_ref.set(session_count)
        
        # Push a new session
        sessions_ref.push({ "user" + str(session_count) : session_count })
    
# firebase_init should not be called by the other modules; the database manager is responsible for initializing itself

if __name__ == "__main__":
    # Test
    DatabaseManager.add_session()