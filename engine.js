// Chessbuds — Chess Engine Module

const PIECE_SYMBOLS = { p:'pawn', n:'knight', b:'bishop', r:'rook', q:'queen', k:'king' };
const UNICODE_PIECES = {
  wk:'♔', wq:'♕', wr:'♖', wb:'♗', wn:'♘', wp:'♙',
  bk:'♚', bq:'♛', br:'♜', bb:'♝', bn:'♞', bp:'♟'
};

class ChessEngine {
  constructor() { this.reset(); }

  reset() {
    // board[row][col], row 0 = rank 8 (black side), row 7 = rank 1 (white side)
    this.board = this.initialBoard();
    this.turn = 'w';
    this.castling = { wk: true, wq: true, bk: true, bq: true };
    this.enPassantTarget = null; // [row, col]
    this.moveHistory = [];
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.inCheck = false;
    this.gameOver = false;
    this.gameResult = '';
    this.capturedPieces = { w: [], b: [] };
  }

  initialBoard() {
    return [
      [{c:'b',t:'r'},{c:'b',t:'n'},{c:'b',t:'b'},{c:'b',t:'q'},{c:'b',t:'k'},{c:'b',t:'b'},{c:'b',t:'n'},{c:'b',t:'r'}],
      [{c:'b',t:'p'},{c:'b',t:'p'},{c:'b',t:'p'},{c:'b',t:'p'},{c:'b',t:'p'},{c:'b',t:'p'},{c:'b',t:'p'},{c:'b',t:'p'}],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [null,null,null,null,null,null,null,null],
      [{c:'w',t:'p'},{c:'w',t:'p'},{c:'w',t:'p'},{c:'w',t:'p'},{c:'w',t:'p'},{c:'w',t:'p'},{c:'w',t:'p'},{c:'w',t:'p'}],
      [{c:'w',t:'r'},{c:'w',t:'n'},{c:'w',t:'b'},{c:'w',t:'q'},{c:'w',t:'k'},{c:'w',t:'b'},{c:'w',t:'n'},{c:'w',t:'r'}]
    ];
  }

  at(r,c) { return (r>=0&&r<8&&c>=0&&c<8) ? this.board[r][c] : undefined; }

  findKing(color) {
    for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
      const p = this.board[r][c];
      if (p && p.c===color && p.t==='k') return [r,c];
    }
    return null;
  }

  isAttackedBy(r, c, byColor) {
    // Pawn attacks
    const pDir = byColor==='w' ? 1 : -1;
    if (this.at(r+pDir,c-1)?.c===byColor && this.at(r+pDir,c-1)?.t==='p') return true;
    if (this.at(r+pDir,c+1)?.c===byColor && this.at(r+pDir,c+1)?.t==='p') return true;
    // Knight attacks
    for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]]) {
      const p = this.at(r+dr,c+dc);
      if (p?.c===byColor && p?.t==='n') return true;
    }
    // King attacks
    for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
      if (dr===0&&dc===0) continue;
      const p = this.at(r+dr,c+dc);
      if (p?.c===byColor && p?.t==='k') return true;
    }
    // Sliding pieces (bishop/rook/queen)
    const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
    for (const [dr,dc] of dirs) {
      const isStraight = dr===0||dc===0;
      const isDiag = !isStraight;
      for (let i=1;i<8;i++) {
        const nr=r+dr*i, nc=c+dc*i;
        if (nr<0||nr>7||nc<0||nc>7) break;
        const p = this.board[nr][nc];
        if (p) {
          if (p.c===byColor) {
            if (p.t==='q') return true;
            if (p.t==='r' && isStraight) return true;
            if (p.t==='b' && isDiag) return true;
          }
          break;
        }
      }
    }
    return false;
  }

  isInCheck(color) {
    const king = this.findKing(color);
    if (!king) return false;
    return this.isAttackedBy(king[0], king[1], color==='w'?'b':'w');
  }

  pseudoLegalMoves(r, c) {
    const piece = this.board[r][c];
    if (!piece) return [];
    const moves = [];
    const color = piece.c;
    const enemy = color==='w'?'b':'w';

    const addMove = (tr,tc,flags={}) => {
      if (tr<0||tr>7||tc<0||tc>7) return;
      const target = this.board[tr][tc];
      if (target && target.c===color) return;
      moves.push({fr:r,fc:c,tr,tc,flags});
    };

    switch(piece.t) {
      case 'p': {
        const dir = color==='w' ? -1 : 1;
        const startRow = color==='w' ? 6 : 1;
        const promoRow = color==='w' ? 0 : 7;
        // Forward
        if (!this.board[r+dir]?.[c]) {
          if (r+dir===promoRow) moves.push({fr:r,fc:c,tr:r+dir,tc:c,flags:{promotion:true}});
          else {
            moves.push({fr:r,fc:c,tr:r+dir,tc:c,flags:{}});
            if (r===startRow && !this.board[r+2*dir][c]) {
              moves.push({fr:r,fc:c,tr:r+2*dir,tc:c,flags:{doublePush:true}});
            }
          }
        }
        // Captures
        for (const dc of [-1,1]) {
          const nc = c+dc;
          if (nc<0||nc>7) continue;
          const target = this.board[r+dir]?.[nc];
          if (target && target.c===enemy) {
            if (r+dir===promoRow) moves.push({fr:r,fc:c,tr:r+dir,tc:nc,flags:{promotion:true}});
            else moves.push({fr:r,fc:c,tr:r+dir,tc:nc,flags:{}});
          }
          // En passant
          if (this.enPassantTarget && this.enPassantTarget[0]===r+dir && this.enPassantTarget[1]===nc) {
            moves.push({fr:r,fc:c,tr:r+dir,tc:nc,flags:{enPassant:true}});
          }
        }
        break;
      }
      case 'n':
        for (const [dr,dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]])
          addMove(r+dr,c+dc);
        break;
      case 'k':
        for (let dr=-1;dr<=1;dr++) for (let dc=-1;dc<=1;dc++) {
          if (dr===0&&dc===0) continue;
          addMove(r+dr,c+dc);
        }
        // Castling
        if (!this.isInCheck(color)) {
          if (color==='w') {
            if (this.castling.wk && !this.board[7][5] && !this.board[7][6]
                && this.board[7][7]?.t==='r' && this.board[7][7]?.c==='w'
                && !this.isAttackedBy(7,5,'b') && !this.isAttackedBy(7,6,'b'))
              moves.push({fr:7,fc:4,tr:7,tc:6,flags:{castle:'k'}});
            if (this.castling.wq && !this.board[7][3] && !this.board[7][2] && !this.board[7][1]
                && this.board[7][0]?.t==='r' && this.board[7][0]?.c==='w'
                && !this.isAttackedBy(7,3,'b') && !this.isAttackedBy(7,2,'b'))
              moves.push({fr:7,fc:4,tr:7,tc:2,flags:{castle:'q'}});
          } else {
            if (this.castling.bk && !this.board[0][5] && !this.board[0][6]
                && this.board[0][7]?.t==='r' && this.board[0][7]?.c==='b'
                && !this.isAttackedBy(0,5,'w') && !this.isAttackedBy(0,6,'w'))
              moves.push({fr:0,fc:4,tr:0,tc:6,flags:{castle:'k'}});
            if (this.castling.bq && !this.board[0][3] && !this.board[0][2] && !this.board[0][1]
                && this.board[0][0]?.t==='r' && this.board[0][0]?.c==='b'
                && !this.isAttackedBy(0,3,'w') && !this.isAttackedBy(0,2,'w'))
              moves.push({fr:0,fc:4,tr:0,tc:2,flags:{castle:'q'}});
          }
        }
        break;
      case 'b':
        for (const [dr,dc] of [[-1,-1],[-1,1],[1,-1],[1,1]])
          for (let i=1;i<8;i++) {
            const nr=r+dr*i, nc=c+dc*i;
            if (nr<0||nr>7||nc<0||nc>7) break;
            const t = this.board[nr][nc];
            if (t) { if(t.c===enemy) moves.push({fr:r,fc:c,tr:nr,tc:nc,flags:{}}); break; }
            moves.push({fr:r,fc:c,tr:nr,tc:nc,flags:{}});
          }
        break;
      case 'r':
        for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1]])
          for (let i=1;i<8;i++) {
            const nr=r+dr*i, nc=c+dc*i;
            if (nr<0||nr>7||nc<0||nc>7) break;
            const t = this.board[nr][nc];
            if (t) { if(t.c===enemy) moves.push({fr:r,fc:c,tr:nr,tc:nc,flags:{}}); break; }
            moves.push({fr:r,fc:c,tr:nr,tc:nc,flags:{}});
          }
        break;
      case 'q':
        for (const [dr,dc] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]])
          for (let i=1;i<8;i++) {
            const nr=r+dr*i, nc=c+dc*i;
            if (nr<0||nr>7||nc<0||nc>7) break;
            const t = this.board[nr][nc];
            if (t) { if(t.c===enemy) moves.push({fr:r,fc:c,tr:nr,tc:nc,flags:{}}); break; }
            moves.push({fr:r,fc:c,tr:nr,tc:nc,flags:{}});
          }
        break;
    }
    return moves;
  }

  legalMoves(r, c) {
    const piece = this.board[r][c];
    if (!piece || piece.c !== this.turn) return [];
    return this.pseudoLegalMoves(r,c).filter(m => {
      // Try the move
      const captured = this.board[m.tr][m.tc];
      const epCapture = m.flags.enPassant ? this.board[m.fr][m.tc] : null;
      this.board[m.tr][m.tc] = piece;
      this.board[m.fr][m.fc] = null;
      if (m.flags.enPassant) this.board[m.fr][m.tc] = null;
      const legal = !this.isInCheck(piece.c);
      // Undo
      this.board[m.fr][m.fc] = piece;
      this.board[m.tr][m.tc] = captured;
      if (m.flags.enPassant) this.board[m.fr][m.tc] = epCapture;
      return legal;
    });
  }

  allLegalMoves(color) {
    const moves = [];
    for (let r=0;r<8;r++) for (let c=0;c<8;c++) {
      const p = this.board[r][c];
      if (p && p.c===color) moves.push(...this.legalMoves(r,c));
    }
    return moves;
  }

  makeMove(move, promotionType) {
    const piece = this.board[move.fr][move.fc];
    const captured = this.board[move.tr][move.tc];
    const snapshot = {
      move, piece: {...piece}, captured, castling: {...this.castling},
      enPassantTarget: this.enPassantTarget ? [...this.enPassantTarget] : null,
      halfMoveClock: this.halfMoveClock, epCaptured: null
    };

    // Capture
    if (captured) {
      this.capturedPieces[captured.c].push(captured.t);
    }

    // En passant capture
    if (move.flags.enPassant) {
      const epPiece = this.board[move.fr][move.tc];
      snapshot.epCaptured = epPiece;
      this.capturedPieces[epPiece.c].push(epPiece.t);
      this.board[move.fr][move.tc] = null;
    }

    // Move piece
    this.board[move.tr][move.tc] = piece;
    this.board[move.fr][move.fc] = null;

    // Pawn promotion
    if (move.flags.promotion) {
      this.board[move.tr][move.tc] = { c: piece.c, t: promotionType || 'q' };
      snapshot.promoted = true;
    }

    // Castling move rook
    if (move.flags.castle) {
      if (move.flags.castle==='k') {
        const row = piece.c==='w'?7:0;
        this.board[row][5] = this.board[row][7];
        this.board[row][7] = null;
      } else {
        const row = piece.c==='w'?7:0;
        this.board[row][3] = this.board[row][0];
        this.board[row][0] = null;
      }
    }

    // Update castling rights
    if (piece.t==='k') {
      if (piece.c==='w') { this.castling.wk=false; this.castling.wq=false; }
      else { this.castling.bk=false; this.castling.bq=false; }
    }
    if (piece.t==='r') {
      if (move.fr===7&&move.fc===0) this.castling.wq=false;
      if (move.fr===7&&move.fc===7) this.castling.wk=false;
      if (move.fr===0&&move.fc===0) this.castling.bq=false;
      if (move.fr===0&&move.fc===7) this.castling.bk=false;
    }
    if (move.tr===7&&move.tc===0) this.castling.wq=false;
    if (move.tr===7&&move.tc===7) this.castling.wk=false;
    if (move.tr===0&&move.tc===0) this.castling.bq=false;
    if (move.tr===0&&move.tc===7) this.castling.bk=false;

    // En passant target
    this.enPassantTarget = null;
    if (move.flags.doublePush) {
      const epRow = (move.fr + move.tr) / 2;
      this.enPassantTarget = [epRow, move.tc];
    }

    // Switch turn
    this.turn = this.turn==='w'?'b':'w';
    this.moveHistory.push(snapshot);

    // Check game state
    this.inCheck = this.isInCheck(this.turn);
    const hasLegalMoves = this.allLegalMoves(this.turn).length > 0;
    if (!hasLegalMoves) {
      this.gameOver = true;
      this.gameResult = this.inCheck
        ? (this.turn==='w' ? 'Black wins by checkmate' : 'White wins by checkmate')
        : 'Draw by stalemate';
    }
  }

  undoLastMove() {
    if (this.moveHistory.length === 0) return false;
    const snap = this.moveHistory.pop();
    const { move, piece, captured, castling, enPassantTarget, halfMoveClock, epCaptured } = snap;

    this.board[move.fr][move.fc] = { c: piece.c, t: piece.t };
    this.board[move.tr][move.tc] = captured;

    if (move.flags.enPassant) {
      this.board[move.fr][move.tc] = epCaptured;
      const idx = this.capturedPieces[epCaptured.c].lastIndexOf(epCaptured.t);
      if (idx>=0) this.capturedPieces[epCaptured.c].splice(idx,1);
    }

    if (captured) {
      const idx = this.capturedPieces[captured.c].lastIndexOf(captured.t);
      if (idx>=0) this.capturedPieces[captured.c].splice(idx,1);
    }

    if (move.flags.castle) {
      if (move.flags.castle==='k') {
        const row = piece.c==='w'?7:0;
        this.board[row][7] = this.board[row][5];
        this.board[row][5] = null;
      } else {
        const row = piece.c==='w'?7:0;
        this.board[row][0] = this.board[row][3];
        this.board[row][3] = null;
      }
    }

    this.castling = castling;
    this.enPassantTarget = enPassantTarget;
    this.halfMoveClock = halfMoveClock;
    this.turn = piece.c;
    this.gameOver = false;
    this.gameResult = '';
    this.inCheck = this.isInCheck(this.turn);
    return true;
  }
}
