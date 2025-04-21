from vlm import VLM

vlm_instance = VLM()
print(vlm_instance.get_ingredients("test_images/good_image.jpg"))
print(vlm_instance.get_recipe("chicken, rice, vegetables"))