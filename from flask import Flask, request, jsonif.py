from flask import Flask, request, jsonify
from chatterbot import ChatBot

app = Flask(__name__)

# Create a chatbot instance
chatbot = ChatBot('MyChatBot')

# Train the chatbot with some example data
chatbot.train([
    'How are you?',
    'I am good, thank you!',
    'What is your name?',
    'My name is ChatBot.'
])

# Define an endpoint for receiving messages and responding


@app.route('/chatbot', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data['message']
    response = chatbot.get_response(user_message)
    return jsonify({'message': str(response)})


if __name__ == '__main__':
    app.run(debug=True)
