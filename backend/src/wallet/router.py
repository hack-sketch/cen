from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.database import get_db
from src.dependencies import get_current_user_from_token
from src.users.models import User
from src.wallet import service as wallet_service
from src.wallet.schemas import CreditTransferRequest, TransactionResponse, WalletBalanceResponse

router = APIRouter(prefix="/wallet", tags=["Wallet & Credits"])


@router.get("/balance", response_model=WalletBalanceResponse)
def get_balance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    balance = wallet_service.get_user_balance(db, current_user.id)
    return WalletBalanceResponse(credit_balance=balance)


@router.get("/transactions", response_model=List[TransactionResponse])
def list_transactions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    return wallet_service.list_user_transactions(db, current_user.id)


@router.post("/transfer", status_code=status.HTTP_200_OK)
def transfer_credits(
    transfer_in: CreditTransferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_from_token),
):
    wallet_service.transfer_credits(db, current_user.id, transfer_in)
    return {"message": "Credits transferred successfully"}
