import logging
from typing import Optional, Dict, Any
from pymongo import MongoClient
from pymongo.database import Database
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.core.config import settings

logger = logging.getLogger("facultyforge.db.mongo")

class MongoDBManager:
    def __init__(self):
        self.client: Optional[MongoClient] = None
        self.db: Optional[Database] = None
        self._is_connected: bool = False

    def connect(self) -> bool:
        """
        Connect to MongoDB using MONGODB_URI.
        If MONGODB_URI is not set, logs a notice and keeps connection state False.
        Does NOT expose credentials in logs or output.
        """
        uri = settings.MONGODB_URI
        if not uri or not uri.strip():
            logger.info("MONGODB_URI is not configured in environment. MongoDB connection deferred.")
            self._is_connected = False
            return False

        try:
            # Server selection timeout set to 5s so health check doesn't hang
            self.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            # Verify connectivity via ping
            self.client.admin.command('ping')
            self.db = self.client[settings.MONGODB_DB_NAME]
            self._is_connected = True
            logger.info("Connected to MongoDB successfully.")
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.warning(f"Could not connect to MongoDB server: {e}")
            self._is_connected = False
            return False
        except Exception as e:
            logger.error(f"Unexpected error connecting to MongoDB: {e}")
            self._is_connected = False
            return False

    def close(self):
        """Close MongoDB client connection."""
        if self.client:
            self.client.close()
            self.client = None
            self.db = None
            self._is_connected = False
            logger.info("Closed MongoDB client connection.")

    def is_connected(self) -> bool:
        """Check live connection status."""
        if not self._is_connected or not self.client:
            return False
        try:
            self.client.admin.command('ping')
            return True
        except Exception:
            self._is_connected = False
            return False

    def get_db(self) -> Optional[Database]:
        """Return active MongoDB database instance."""
        return self.db

mongo_manager = MongoDBManager()

def get_mongo_db() -> Optional[Database]:
    """Dependency / accessor for MongoDB database instance."""
    return mongo_manager.get_db()
