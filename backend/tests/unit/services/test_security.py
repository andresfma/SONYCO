import pytest
from datetime import timedelta, datetime, timezone
from jose import jwt
from jose.exceptions import ExpiredSignatureError
from passlib.context import CryptContext

from app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.core.config import settings


# Definir SECRET_KEY para pruebas (no usar .env)
TEST_SECRET_KEY = "test-secret-key-for-unit-tests"

# Contexto de passlib para verificar hashes generados
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class TestGetPasswordHash:
    """Pruebas para la función get_password_hash"""

    def test_creates_valid_hash(self):
        """Test que verifica que se crea un hash válido"""
        password = "mi_secreta123"
        hashed = get_password_hash(password)

        # El hash no debe ser igual al password
        assert hashed != password
        # El hash debe ser verificable con passlib
        assert pwd_context.verify(password, hashed)

    def test_with_empty_string(self):
        """Test con string vacío"""
        password = ""
        hashed = get_password_hash(password)
        assert hashed != password
        assert pwd_context.verify(password, hashed)

    def test_with_special_characters(self):
        """Test con caracteres especiales"""
        password = "p@ssw0rd!#$%"
        hashed = get_password_hash(password)
        assert hashed != password
        assert pwd_context.verify(password, hashed)

    def test_with_unicode_characters(self):
        """Test con caracteres unicode"""
        password = "contraseña123ñáéíóú"
        hashed = get_password_hash(password)
        assert hashed != password
        assert pwd_context.verify(password, hashed)

    def test_with_long_password(self):
        """Test con password muy largo"""
        password = "a" * 1000  # Password de 1000 caracteres
        hashed = get_password_hash(password)
        assert hashed != password
        assert pwd_context.verify(password, hashed)

    def test_same_password_different_hashes(self):
        """Test que verifica que el mismo password genera hashes diferentes (salt)"""
        password = "same_password"
        hash1 = get_password_hash(password)
        hash2 = get_password_hash(password)
        
        # Los hashes deben ser diferentes debido al salt
        assert hash1 != hash2
        # Pero ambos deben verificar correctamente
        assert pwd_context.verify(password, hash1)
        assert pwd_context.verify(password, hash2)


class TestVerifyPassword:
    """Pruebas para la función verify_password"""

    def test_verify_correct_password(self):
        """Test verificación de password correcto"""
        password = "correct_password"
        hashed = get_password_hash(password)
        assert verify_password(password, hashed) is True

    def test_verify_incorrect_password(self):
        """Test verificación de password incorrecto"""
        password = "correct_password"
        hashed = get_password_hash(password)
        assert verify_password("wrong_password", hashed) is False

    def test_verify_empty_password(self):
        """Test verificación de password vacío"""
        password = ""
        hashed = get_password_hash(password)
        assert verify_password("", hashed) is True
        assert verify_password("not_empty", hashed) is False

    def test_verify_with_invalid_hash(self):
        """Test verificación con hash inválido"""
        with pytest.raises(ValueError):  # passlib lanza ValueError con hash inválido
            verify_password("password", "not_a_valid_hash")

    def test_verify_with_none_hash(self):
        """Test verificación con hash None"""
        assert verify_password("password", None) is False

    def test_verify_case_sensitive(self):
        """Test que verifica que la verificación es case-sensitive"""
        password = "CaseSensitive"
        hashed = get_password_hash(password)
        assert verify_password("CaseSensitive", hashed) is True
        assert verify_password("casesensitive", hashed) is False
        assert verify_password("CASESENSITIVE", hashed) is False

    def test_verify_with_whitespace_differences(self):
        """Test con diferencias de espacios en blanco"""
        password = "password"
        hashed = get_password_hash(password)
        assert verify_password("password", hashed) is True
        assert verify_password(" password", hashed) is False
        assert verify_password("password ", hashed) is False


class TestCreateAccessToken:
    """Pruebas para la función create_access_token"""

    def test_default_expiration(self):
        """Test creación de token con expiración por defecto"""
        data = {"sub": "user1"}
        token = create_access_token(data)
        decoded = jwt.decode(token, TEST_SECRET_KEY, algorithms=[settings.ALGORITHM])

        assert decoded["sub"] == "user1"
        assert "exp" in decoded
        assert decoded["exp"] > datetime.now(timezone.utc).timestamp()

    def test_with_custom_expiration(self):
        """Test creación de token con expiración personalizada"""
        data = {"sub": "user2"}
        expires_delta = timedelta(minutes=1)
        token = create_access_token(data, expires_delta=expires_delta)
        decoded = jwt.decode(token, TEST_SECRET_KEY, algorithms=[settings.ALGORITHM])

        assert decoded["sub"] == "user2"
        # El exp debe estar aproximadamente a 1 min de ahora
        exp_time = datetime.fromtimestamp(decoded["exp"], tz=timezone.utc)
        diff = exp_time - datetime.now(timezone.utc)
        assert 0 < diff.total_seconds() <= 60

    def test_with_zero_expiration(self):
        """Test creación de token con expiración inmediata"""
        data = {"sub": "user_zero"}
        expires_delta = timedelta(seconds=0)
        token = create_access_token(data, expires_delta=expires_delta)
        decoded = jwt.decode(token, TEST_SECRET_KEY, algorithms=[settings.ALGORITHM])

        assert decoded["sub"] == "user_zero"
        exp_time = datetime.fromtimestamp(decoded["exp"], tz=timezone.utc)
        now = datetime.now(timezone.utc)
        # Debe expirar aproximadamente ahora
        assert abs((exp_time - now).total_seconds()) <= 1

    def test_with_negative_expiration(self):
        """Test creación de token con expiración en el pasado"""
        data = {"sub": "expired_user"}
        expires_delta = timedelta(minutes=-5)
        token = create_access_token(data, expires_delta=expires_delta)

        with pytest.raises(ExpiredSignatureError):
            jwt.decode(token, TEST_SECRET_KEY, algorithms=[settings.ALGORITHM])

    def test_with_additional_claims(self):
        """Test creación de token con claims adicionales"""
        data = {
            "sub": "user3",
            "role": "admin",
            "permissions": ["read", "write"]
        }
        token = create_access_token(data)
        decoded = jwt.decode(token, TEST_SECRET_KEY, algorithms=[settings.ALGORITHM])

        assert decoded["sub"] == "user3"
        assert decoded["role"] == "admin"
        assert decoded["permissions"] == ["read", "write"]

    def test_with_empty_data(self):
        """Test creación de token con datos vacíos"""
        data = {}
        token = create_access_token(data)
        decoded = jwt.decode(token, TEST_SECRET_KEY, algorithms=[settings.ALGORITHM])

        # Debe tener al menos la expiración
        assert "exp" in decoded
        assert len(decoded) >= 1

    def test_token_structure(self):
        """Test que verifica la estructura del token JWT"""
        data = {"sub": "user4"}
        token = create_access_token(data)
        
        # Un JWT debe tener 3 partes separadas por puntos
        parts = token.split(".")
        assert len(parts) == 3
        
        # Cada parte debe ser base64
        for part in parts:
            assert len(part) > 0


class TestDecodeAccessToken:
    """Pruebas para la función decode_access_token"""

    def test_valid_token(self):
        """Test decodificación de token válido"""
        data = {"sub": "user3"}
        token = create_access_token(data, expires_delta=timedelta(minutes=1))
        payload = decode_access_token(token)
        assert payload["sub"] == "user3"

    def test_expired_token(self):
        """Test decodificación de token expirado"""
        data = {"sub": "expired_user"}
        token = create_access_token(data, expires_delta=timedelta(seconds=-1))
        result = decode_access_token(token)
        assert result is None  # Debe atrapar el JWTError y devolver None

    def test_invalid_token_format(self):
        """Test decodificación de token con formato inválido"""
        invalid_token = "this.is.not.a.valid.token"
        result = decode_access_token(invalid_token)
        assert result is None

    def test_tampered_signature(self):
        """Test decodificación de token con firma alterada"""
        data = {"sub": "user4"}
        token = create_access_token(data, expires_delta=timedelta(minutes=5))
        # alteramos el token
        tampered_token = token + "abc"
        result = decode_access_token(tampered_token)
        assert result is None

    def test_empty_token(self):
        """Test decodificación de token vacío"""
        result = decode_access_token("")
        assert result is None

    def test_none_token(self):
        """Test decodificación de token None"""
        result = decode_access_token(None)
        assert result is None

    def test_token_with_wrong_algorithm(self):
        """Test decodificación de token creado con algoritmo diferente"""
        data = {"sub": "user5"}
        # Crear token con algoritmo diferente
        wrong_token = jwt.encode(data, TEST_SECRET_KEY, algorithm="HS512")
        result = decode_access_token(wrong_token)
        assert result is None

    def test_token_with_wrong_secret(self):
        """Test decodificación de token creado con secret diferente"""
        data = {"sub": "user6"}
        # Crear token con secret diferente
        wrong_token = jwt.encode(
            data, 
            "wrong-secret", 
            algorithm=settings.ALGORITHM
        )
        result = decode_access_token(wrong_token)
        assert result is None

    def test_malformed_jwt_parts(self):
        """Test decodificación de JWT malformado"""
        malformed_tokens = [
            "only.one.part",  # Solo dos partes
            "too.many.parts.here.invalid",  # Demasiadas partes
            "invalid-base64.content.here",  # Base64 inválido
        ]
        
        for token in malformed_tokens:
            result = decode_access_token(token)
            assert result is None

    def test_decode_preserves_all_claims(self):
        """Test que la decodificación preserva todos los claims"""
        data = {
            "sub": "user7",
            "role": "admin",
            "permissions": ["read", "write", "delete"],
            "custom_field": "custom_value"
        }
        token = create_access_token(data, expires_delta=timedelta(minutes=5))
        payload = decode_access_token(token)
        
        assert payload["sub"] == "user7"
        assert payload["role"] == "admin"
        assert payload["permissions"] == ["read", "write", "delete"]
        assert payload["custom_field"] == "custom_value"
        assert "exp" in payload  # Debe incluir expiración


class TestSecurityIntegration:
    """Pruebas de integración para funciones de seguridad"""

    def test_password_hash_and_verify_flow(self):
        """Test del flujo completo: hash -> verify"""
        original_password = "test_password_123"
        
        # Hash del password
        hashed = get_password_hash(original_password)
        
        # Verificar password correcto
        assert verify_password(original_password, hashed) is True
        
        # Verificar password incorrecto
        assert verify_password("wrong_password", hashed) is False

    def test_token_create_and_decode_flow(self):
        """Test del flujo completo: create_token -> decode_token"""
        user_data = {
            "sub": "integration_user",
            "role": "user",
            "email": "test@example.com"
        }
        
        # Crear token
        token = create_access_token(user_data, expires_delta=timedelta(minutes=5))
        
        # Decodificar token
        decoded_data = decode_access_token(token)
        
        assert decoded_data["sub"] == "integration_user"
        assert decoded_data["role"] == "user"
        assert decoded_data["email"] == "test@example.com"
        assert "exp" in decoded_data

    def test_multiple_tokens_independence(self):
        """Test que múltiples tokens son independientes"""
        user1_data = {"sub": "user1", "role": "admin"}
        user2_data = {"sub": "user2", "role": "user"}
        
        token1 = create_access_token(user1_data, expires_delta=timedelta(minutes=5))
        token2 = create_access_token(user2_data, expires_delta=timedelta(minutes=5))
        
        # Los tokens deben ser diferentes
        assert token1 != token2
        
        # Cada token debe decodificar a su respectivo usuario
        decoded1 = decode_access_token(token1)
        decoded2 = decode_access_token(token2)
        
        assert decoded1["sub"] == "user1"
        assert decoded1["role"] == "admin"
        
        assert decoded2["sub"] == "user2"
        assert decoded2["role"] == "user"


# ================================
# FIXTURES Y CONFIGURACIONES
# ================================

@pytest.fixture(autouse=True)
def mock_secret_key(monkeypatch):
    """
    Fixture que automáticamente reemplaza la SECRET_KEY en las pruebas
    """
    # Mock de la variable de entorno SECRET_KEY
    monkeypatch.setenv("SECRET_KEY", TEST_SECRET_KEY)
    
    # También mockear la variable SECRET_KEY directamente en el módulo de security
    monkeypatch.setattr("app.core.security.SECRET_KEY", TEST_SECRET_KEY)