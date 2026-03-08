package models

import (
    "os"
    "testing"
)

func TestLoadConfig(t *testing.T) {
    // Clear potentially existing env vars
    os.Unsetenv("DB_USER")
    os.Unsetenv("DB_PASSWORD")
    os.Unsetenv("DB_HOST")
    os.Unsetenv("DB_PORT")
    os.Unsetenv("DB_NAME")

    // Test default configuration (no env vars)
    LoadConfig()
    
    // Test the defaults defined in LoadConfig
    if AppConfig.DBUser != "sundrabomjan_db_user" {
        t.Errorf("Expected default DBUser to be 'sundrabomjan_db_user', got %s", AppConfig.DBUser)
    }
    if AppConfig.DBPassword != "Y8SryA7wl8UkwOT7" {
        t.Errorf("Expected default DBPassword to be 'Y8SryA7wl8UkwOT7', got %s", AppConfig.DBPassword)
    }
    if AppConfig.DBHost != "cluster0.jicst7g.mongodb.net" {
        t.Errorf("Expected default DBHost to be 'cluster0.jicst7g.mongodb.net', got %s", AppConfig.DBHost)
    }
    if AppConfig.DBName != "timetable_db" {
        t.Errorf("Expected default DBName to be 'timetable_db', got %s", AppConfig.DBName)
    }

    // Test loading configuration from environment vars
    os.Setenv("DB_USER", "test_user")
    os.Setenv("DB_PASSWORD", "test_pass")
    os.Setenv("DB_HOST", "localhost")
    os.Setenv("DB_PORT", "27018")
    os.Setenv("DB_NAME", "test_db")

    LoadConfig()

    // Test overrides
    if AppConfig.DBUser != "test_user" {
        t.Errorf("Expected overridden DBUser to be 'test_user', got %s", AppConfig.DBUser)
    }
    if AppConfig.DBPassword != "test_pass" {
        t.Errorf("Expected overridden DBPassword to be 'test_pass', got %s", AppConfig.DBPassword)
    }
    if AppConfig.DBHost != "localhost" {
        t.Errorf("Expected overridden DBHost to be 'localhost', got %s", AppConfig.DBHost)
    }
    if AppConfig.DBPort != "27018" {
        t.Errorf("Expected overridden DBPort to be '27018', got %s", AppConfig.DBPort)
    }
    if AppConfig.DBName != "test_db" {
        t.Errorf("Expected overridden DBName to be 'test_db', got %s", AppConfig.DBName)
    }
    
    // Clean up
    os.Unsetenv("DB_USER")
    os.Unsetenv("DB_PASSWORD")
    os.Unsetenv("DB_HOST")
    os.Unsetenv("DB_PORT")
    os.Unsetenv("DB_NAME")
}
