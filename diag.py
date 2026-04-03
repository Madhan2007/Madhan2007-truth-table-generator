import traceback
import sys

try:
    import fastapi
    print("FastAPI imported")
    import pydantic
    print("Pydantic imported")
    import ttg
    print("TTG imported")
    import uvicorn
    print("Uvicorn imported")
except Exception:
    with open("error_log.txt", "w") as f:
        f.write(traceback.format_exc())
    sys.exit(1)
except ImportError:
    with open("error_log.txt", "w") as f:
        f.write(traceback.format_exc())
    sys.exit(1)
