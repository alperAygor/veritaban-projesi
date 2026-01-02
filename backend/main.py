from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, tools, users, reservations, admin, reports

# App Init
app = FastAPI(title="ToolShare API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(tools.router)
app.include_router(reservations.router) # contains reviews route too in prefix api/ but reviews is separate in file?
                                        # Wait, reviews route was @app.post("/api/reviews"), I put it in reservations.py with @router.post("/reviews") prefix /api
                                        # So it becomes /api/reviews. Correct.
app.include_router(admin.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to ToolShare API v2 (Refactored)"}
