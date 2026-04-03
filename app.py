from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import ttg
import traceback
import uvicorn

app = FastAPI(title="Truth Table Generator API")

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
async def read_index():
    return FileResponse("static/index.html")

class TruthTableRequest(BaseModel):
    variables: str
    propositions: str = ""
    ints: bool = False
    ascending: bool = False

@app.post("/api/generate")
async def generate_table(req: TruthTableRequest):
    try:
        # Parse inputs
        variables = [v.strip() for v in req.variables.split(",") if v.strip()]
        if not variables:
            raise HTTPException(status_code=400, detail="At least one variable is required.")
            
        propositions = [p.strip() for p in req.propositions.split(",") if p.strip()]
        
        phrases = propositions if len(propositions) > 0 else None
        
        table = ttg.Truths(bases=variables, phrases=phrases, ints=req.ints, ascending=req.ascending)
        
        df = table.as_pandas
        columns = list(df.columns)
        
        # We need to fillna if there are issues, but for TTG it's all booleans/ints.
        data = df.to_dict(orient='records')
        
        return {"columns": columns, "data": data}
        
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
