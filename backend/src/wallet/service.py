from datetime import date
from typing import List
from sqlalchemy.orm import Session

from src.exceptions import APIException, InsufficientCreditsException, NotFoundException
from src.users.models import User
from src.wallet.models import Transaction
from src.wallet.schemas import CreditTransferRequest


def get_user_balance(db: Session, user_id: str) -> int:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise NotFoundException(f"User with ID '{user_id}' not found")
    return user.credit_balance or 0


def list_user_transactions(db: Session, user_id: str) -> List[Transaction]:
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.id.desc())
        .all()
    )


def transfer_credits(
    db: Session, from_user_id: str, transfer_in: CreditTransferRequest
) -> bool:
    if from_user_id == transfer_in.to_user_id:
        raise APIException(
            status_code=400,
            detail="You cannot transfer credits to yourself.",
            code="INVALID_TRANSFER",
        )

    sender = db.query(User).filter(User.id == from_user_id).first()
    if not sender:
        raise NotFoundException(f"Sender user with ID '{from_user_id}' not found")

    receiver = db.query(User).filter(User.id == transfer_in.to_user_id).first()
    if not receiver:
        raise NotFoundException(f"Recipient user with ID '{transfer_in.to_user_id}' not found")

    amount = transfer_in.amount
    if amount <= 0:
        raise APIException(
            status_code=400,
            detail="Transfer amount must be greater than zero.",
            code="INVALID_AMOUNT",
        )

    # Atomic balance check and mutation inside transaction block
    if (sender.credit_balance or 0) < amount:
        raise InsufficientCreditsException(
            detail=f"Insufficient credit balance. Available: {sender.credit_balance}, Required: {amount}"
        )

    sender.credit_balance = (sender.credit_balance or 0) - amount
    receiver.credit_balance = (receiver.credit_balance or 0) + amount

    today_str = date.today().isoformat()

    # Log dual transaction records
    spent_tx = Transaction(
        user_id=sender.id,
        type="spent",
        amount=amount,
        description=f"{transfer_in.description} (to {receiver.name})",
        date=today_str,
    )
    earned_tx = Transaction(
        user_id=receiver.id,
        type="earned",
        amount=amount,
        description=f"{transfer_in.description} (from {sender.name})",
        date=today_str,
    )

    db.add(spent_tx)
    db.add(earned_tx)
    db.commit()
    return True
