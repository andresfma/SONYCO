import random
from locust import HttpUser, task, between
from tests.performance.seed_test import NUM_USUARIOS

# Lista de usuarios generada según seed
USUARIOS = [
    {"email": f"user{i}@test.com", "password": "password123"}
    for i in range(NUM_USUARIOS)
]

# Usuario admin
USUARIOS.append({"email": "admin@admin.com", "password": "admin"})

class LoginUser(HttpUser):
    wait_time = between(1, 3)

    @task
    def login(self):
        usuario = random.choice(USUARIOS)
        self.client.post("/api/v1/auth/login", json=usuario)
