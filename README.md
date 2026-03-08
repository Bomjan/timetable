# timetable

## Backend Configuration

The backend uses MongoDB as its primary database. By default, it will attempt to connect to a shared Atlas cluster. 

You can override the database connection parameters using the following environment variables:

- `DB_USER`: The MongoDB username
- `DB_PASSWORD`: The MongoDB password
- `DB_HOST`: The MongoDB host (default: cluster0.jicst7g.mongodb.net for SRV, or localhost)
- `DB_PORT`: The MongoDB port (default: 27017, only used for non-SRV connections)
- `DB_NAME`: The target database name (default: timetable_db)

If the connection to MongoDB fails, the backend will automatically fallback to an IN-MEMORY mode for testing purposes.
