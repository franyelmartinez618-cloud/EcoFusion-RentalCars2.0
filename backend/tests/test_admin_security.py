import unittest
from pydantic import ValidationError

from main import (
    AdminRecoveryPayload,
    hash_admin_secret,
    square_checkout_idempotency_key,
    verify_admin_secret,
)


class AdminCredentialSecurityTests(unittest.TestCase):
    def test_password_hash_is_salted_and_verifiable(self):
        first = hash_admin_secret("A-Strong-Test-Password-2026!")
        second = hash_admin_secret("A-Strong-Test-Password-2026!")

        self.assertNotEqual(first, second, "Each password hash must use a unique salt")
        self.assertTrue(verify_admin_secret("A-Strong-Test-Password-2026!", first))
        self.assertTrue(verify_admin_secret("A-Strong-Test-Password-2026!", second))

    def test_wrong_password_is_rejected(self):
        encoded = hash_admin_secret("A-Strong-Test-Password-2026!")
        self.assertFalse(verify_admin_secret("wrong-password", encoded))

    def test_malformed_hash_is_rejected_safely(self):
        for malformed in ("", "pbkdf2_sha256$0$bad$bad", "other$600000$00$00"):
            with self.subTest(malformed=malformed):
                self.assertFalse(verify_admin_secret("anything", malformed))

    def test_admin_recovery_requires_long_password(self):
        with self.assertRaises(ValidationError):
            AdminRecoveryPayload(
                username="operator",
                recovery_code="R" * 40,
                new_password="too-short",
            )

    def test_square_checkout_idempotency_is_stable_per_attempt(self):
        first = square_checkout_idempotency_key("RS-ABC123", 1)
        retry = square_checkout_idempotency_key("RS-ABC123", 1)
        next_attempt = square_checkout_idempotency_key("RS-ABC123", 2)

        self.assertEqual(first, retry)
        self.assertNotEqual(first, next_attempt)
        self.assertEqual(len(first), 32)


if __name__ == "__main__":
    unittest.main()
