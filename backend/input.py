import re

def process_ingredient_input(input_text):
    """
    Returns a list of clean ingredient names or an error message.
    """
    if not input_text or input_text.strip() == "":
        return "Error: No ingredients provided."

    # Split by commas, spaces, or newlines using regex
    raw_items = re.split(r'[, \n]+', input_text)
    ingredients = [item.strip() for item in raw_items if item.strip()]

    if not ingredients:
        return "Error: No valid ingredients found."

    return ingredients


def simulate_uc22():
    print("Chat interface: [Input Text] button displayed")

    user_clicks_input = input("Press 'y' to simulate pressing 'Input Text' button: ")
    if user_clicks_input.lower() != 'y':
        print("Simulation stopped.")
        return

    print("Please enter your ingredients (comma, space, or newline separated):")
    print("Example: tomato, onion garlic\nPress Enter twice when you're done.\n")

    input_lines = []
    while True:
        line = input()
        if line == "":
            break
        input_lines.append(line)

    ingredient_input = "\n".join(input_lines)
    print("User presses Continue...")

    result = process_ingredient_input(ingredient_input)

    print("\n--- Output ---")
    if isinstance(result, list):
        print("Ingredients listed in chat interface and VLM:")
        for item in result:
            print(f"- {item}")
    else:
        print(result)


if __name__ == "__main__":
    simulate_uc22()
