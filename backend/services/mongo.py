from pymongo import MongoClient
from pymongo.errors import ServerSelectionTimeoutError, ConnectionFailure
from datetime import datetime
import os
import json
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

# MongoDB Configuration
# For MongoDB Atlas, use connection string like:
# mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")

def encode_mongo_url(url: str) -> str:
    """
    Encode MongoDB URL credentials according to RFC 3986.
    Handles special characters in username and password.
    """
    if "mongodb+srv://" in url and "@" in url:
        try:
            # Split scheme from rest
            scheme_part = "mongodb+srv://"
            rest = url.split(scheme_part)[1]
            
            # Find the credentials part (before the last @)
            last_at = rest.rfind("@")
            if last_at > 0:
                credentials = rest[:last_at]
                host_part = rest[last_at+1:]
                
                # Split username and password
                if ":" in credentials:
                    username, password = credentials.split(":", 1)
                    # URL encode them
                    username_encoded = quote_plus(username)
                    password_encoded = quote_plus(password)
                    # Reconstruct URL
                    url = f"{scheme_part}{username_encoded}:{password_encoded}@{host_part}"
                    print(f"✓ MongoDB URL credentials encoded")
        except Exception as e:
            print(f"⚠️  Could not encode MongoDB URL: {e}")
    
    return url

class MongoService:
    def __init__(self):
        self.connected = False
        self.client = None
        self.db = None
        self.collection = None
        self.city_comparison_collection = None
        self.connect()
    
    def connect(self):
        """Connect to MongoDB (local or Atlas)"""
        try:
            print(f"Attempting to connect to MongoDB...")
            # Encode the URL to handle special characters
            safe_url = encode_mongo_url(MONGO_URL)
            # For Atlas, connection string includes credentials
            self.client = MongoClient(safe_url, serverSelectionTimeoutMS=10000)
            # Verify connection
            self.client.admin.command('ping')
            self.db = self.client["realty_genie"]
            self.collection = self.db["market_reports"]
            self.city_comparison_collection = self.db["city_comparisons"]
            self.connected = True
            print("✅ Connected to MongoDB (Atlas or Local)")
            return True
        except (ServerSelectionTimeoutError, ConnectionFailure) as e:
            self.connected = False
            print(f"⚠️  MongoDB connection failed: {e}")
            print("   Make sure MONGO_URL environment variable is set correctly")
            print("   For Atlas: mongodb+srv://username:password@cluster.xxxxx.mongodb.net/")
            return False
        except Exception as e:
            self.connected = False
            print(f"❌ Unexpected error connecting to MongoDB: {e}")
            return False
    
    def save_report(self, month: str, year: str, data: dict) -> str:
        """
        Save market report to MongoDB (local or Atlas)
        Merges with existing data if document already exists
        
        Args:
            month: Month name (e.g., "October", "November")
            data: Parsed JSON data from Gemini API
        
        Returns:
            Inserted document ID as string
        """
        if not self.connected:
            print("⚠️  MongoDB not connected, skipping save")
            print("   Ensure MONGO_URL is set and MongoDB is accessible")
            return None
        
        try:
            # Check if document exists
            existing = self.collection.find_one({"month": month, "year": year})
            
            if existing:
                # Merge data with existing document
                existing_data = existing.get("data", {})
                
                # Merge: new data takes precedence, but keep existing fields not in new data
                merged_data = {**existing_data, **data}
                
                # Update with merged data
                update_doc = {
                    "month": month,
                    "data": merged_data,
                    "updated_at": datetime.utcnow(),
                    "json_valid": True,
                    "year": year,
                    "source": "Gemini API Analysis"
                }
                
                result = self.collection.update_one(
                    {"month": month, "year": year},
                    {"$set": update_doc}
                )
                
                print(f"✅ Updated existing report in MongoDB for {month} {year} (merged data)")
                return str(existing["_id"])
            else:
                # Create new document
                document = {
                    "month": month,
                    "data": data,
                    "updated_at": datetime.utcnow(),
                    "created_at": datetime.utcnow(),
                    "json_valid": True,
                    "year": year,
                    "source": "Gemini API Analysis"
                }
                
                result = self.collection.insert_one(document)
                print(f"✅ Created new report in MongoDB with ID: {result.inserted_id}")
                return str(result.inserted_id)
                
        except Exception as e:
            print(f"❌ Failed to save to MongoDB: {e}")
            return None
    
    def get_report(self, month: str, year: str = None):
        """
        Retrieve market report from MongoDB
        
        Args:
            month: Month name
            year: Year (optional, defaults to latest if not provided)
        
        Returns:
            Document dict or None
        """
        if not self.connected:
            return None
        
        try:
            query = {"month": month}
            if year is not None:
                query["year"] = year
            report = self.collection.find_one(query, sort=[("year", -1)])
            if report:
                report["_id"] = str(report["_id"])  # Convert ObjectId to string
            return report
        except Exception as e:
            print(f"❌ Failed to retrieve from MongoDB: {e}")
            return None
    
    def get_all_reports(self, year: str = None):
        """
        Retrieve all market reports from MongoDB
        
        Args:
            year: Year to filter (optional, returns all if not provided)
        
        Returns:
            List of documents
        """
        if not self.connected:
            return []
        
        try:
            query = {"year": year} if year is not None else {}
            reports = list(self.collection.find(query, sort=[("year", -1), ("created_at", -1)]))
            for report in reports:
                report["_id"] = str(report["_id"])  # Convert ObjectId to string
            return reports
        except Exception as e:
            print(f"❌ Failed to retrieve reports from MongoDB: {e}")
            return []
    
    def delete_report(self, month: str, year: str = 2025) -> bool:
        """
        Delete market report from MongoDB
        
        Args:
            month: Month name
            year: Year (defaults to 2025)
        
        Returns:
            True if deleted, False otherwise
        """
        if not self.connected:
            return False
        
        try:
            result = self.collection.delete_one({
                "month": month,
                "year": year
            })
            if result.deleted_count > 0:
                print(f"✅ Deleted report for {month}")
                return True
            else:
                print(f"⚠️  No report found for {month}")
                return False
        except Exception as e:
            print(f"❌ Failed to delete from MongoDB: {e}")
            return False
    
    def update_infographic_data(self, month: str, year: str, infographic_data: dict) -> bool:
        """
        Update only the visual_infographic_data field in an existing report
        
        Args:
            month: Month name
            year: Year
            infographic_data: Visual infographic data dictionary
        
        Returns:
            True if successful, False otherwise
        """
        if not self.connected:
            print("⚠️  MongoDB not connected, skipping update")
            return False
        
        try:
            result = self.collection.update_one(
                {"month": month, "year": year},
                {
                    "$set": {
                        "data.visual_infographic_data": infographic_data,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                print(f"✅ Updated infographic data for {month} {year}")
                return True
            elif result.matched_count > 0:
                print(f"⚠️  Document found but no changes made for {month} {year}")
                return True
            else:
                print(f"⚠️  No document found to update for {month} {year}")
                return False
        except Exception as e:
            print(f"❌ Failed to update infographic data: {e}")
            return False
    
    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            self.connected = False
            print("🔌 MongoDB connection closed")
    
    def save_city_comparison(self, month: str, year: str, cities: list, summary: str) -> str:
        """
        Save city comparison report to MongoDB
        
        Args:
            month: Month name (e.g., "October", "November")
            year: Year string
            cities: List of city data dictionaries
            summary: Market summary text
        
        Returns:
            Inserted document ID as string or None
        """
        if not self.connected:
            print("⚠️  MongoDB not connected, skipping save")
            return None
        
        try:
            # Extract city names for query
            city_names = sorted([city.get("name") for city in cities])
            
            # Check if comparison already exists
            existing = self.city_comparison_collection.find_one({
                "month": month,
                "year": year,
                "city_names": city_names
            })
            
            document = {
                "month": month,
                "year": year,
                "city_names": city_names,
                "cities": cities,
                "summary": summary,
                "updated_at": datetime.utcnow()
            }
            
            if existing:
                # Update existing document
                document["created_at"] = existing.get("created_at", datetime.utcnow())
                result = self.city_comparison_collection.update_one(
                    {"_id": existing["_id"]},
                    {"$set": document}
                )
                print(f"✅ Updated city comparison in MongoDB (ID: {existing['_id']})")
                return str(existing["_id"])
            else:
                # Insert new document
                document["created_at"] = datetime.utcnow()
                result = self.city_comparison_collection.insert_one(document)
                print(f"✅ Saved city comparison to MongoDB (ID: {result.inserted_id})")
                return str(result.inserted_id)
        except Exception as e:
            print(f"❌ Failed to save city comparison to MongoDB: {e}")
            return None
    
    def get_city_comparison(self, month: str = None, year: str = None, limit: int = 50):
        """
        Retrieve city comparison reports from MongoDB
        
        Args:
            month: Month name (optional)
            year: Year string (optional)
            limit: Maximum number of results
        
        Returns:
            List of comparison documents
        """
        if not self.connected:
            return []
        
        try:
            query = {}
            if month:
                query["month"] = month
            if year:
                query["year"] = year
            
            comparisons = list(
                self.city_comparison_collection
                .find(query)
                .sort([("year", -1), ("created_at", -1)])
                .limit(limit)
            )
            
            for comp in comparisons:
                comp["_id"] = str(comp["_id"])  # Convert ObjectId to string
            
            return comparisons
        except Exception as e:
            print(f"❌ Failed to retrieve city comparisons from MongoDB: {e}")
            return []
    
    def create_indexes(self):
        """Create database indexes for better query performance"""
        if not self.connected:
            return False
        
        try:
            # Market reports indexes
            self.collection.create_index([("month", 1), ("year", 1)], unique=True)
            self.collection.create_index([("created_at", -1)])
            
            # City comparisons indexes
            self.city_comparison_collection.create_index([("month", 1), ("year", 1)])
            self.city_comparison_collection.create_index([("city_names", 1)])
            self.city_comparison_collection.create_index([("created_at", -1)])
            
            print("✅ Database indexes created")
            return True
        except Exception as e:
            print(f"⚠️  Warning creating indexes: {e}")
            return False

# Global instance
mongo_service = MongoService()
# Create indexes on initialization
mongo_service.create_indexes()
