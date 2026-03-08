ID=$(curl -s -X POST http://127.0.0.1:8080/classes -H "Content-Type: application/json" -d '{"name": "DeleteMe"}' | grep -oP '"id":"\K[^"]+')
echo "Created ID: $ID"
curl -s -X DELETE http://127.0.0.1:8080/classes/$ID
echo "\nDeleted ID: $ID"
curl -s http://127.0.0.1:8080/classes
