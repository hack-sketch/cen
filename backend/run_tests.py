import sys
import pytest

if __name__ == "__main__":
    result = pytest.main(["-v", "tests"])
    sys.exit(result)
