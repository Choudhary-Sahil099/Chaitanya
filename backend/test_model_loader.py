from app.services.model_loader import model_loader

print("\nModel loader test")
print("-----------------")

print("Device:", model_loader.device)
print("Model:", model_loader.config["model_name"])
print("Classes:", model_loader.class_names)
print("Temperature:", model_loader.temperature)
print("Model mode:", model_loader.model.training)

print("\nModel loader working successfully!")