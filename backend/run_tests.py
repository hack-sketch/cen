import sys
from pathlib import Path
import pytest

# Ensure the backend directory is in sys.path regardless of where python is executed from
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

if __name__ == "__main__":
    result = pytest.main(["-v", str(backend_dir / "tests")])
    sys.exit(result)
