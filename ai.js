// Chessbuds — Chess AI Module

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };

// Piece-square tables (from white's perspective, index 0 = rank 8)
const PST = {
  p: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 20, 20,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-20,-20, 10, 10,  5],
    [ 0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10, 10,  5, 10, 10,  5, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [
    [ 0,  0,  0,  0,  0,  0,  0,  0],
    [ 5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [ 0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [ 20, 20,  0,  0,  0,  0, 20, 20],
    [ 20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

// ── Opening Book ──
const BOOK_FILES = 'abcdefgh';
const BOOK_RANKS = '87654321';
function moveToBookStr(move) {
  return BOOK_FILES[move.fc] + BOOK_RANKS[move.fr] + BOOK_FILES[move.tc] + BOOK_RANKS[move.tr];
}

const OPENING_BOOK = {
  // White's first move (weighted: e4 and d4 most common)
  '': ['e2e4', 'e2e4', 'e2e4', 'd2d4', 'd2d4', 'd2d4', 'c2c4', 'g1f3'],

  // ── After 1.e4 ──
  'e2e4': ['e7e5', 'e7e5', 'c7c5', 'c7c5', 'e7e6', 'd7d5', 'c7c6', 'g8f6'],

  // 1.e4 e5 (Open Game)
  'e2e4,e7e5': ['g1f3', 'g1f3', 'g1f3', 'f1c4', 'b1c3'],
  'e2e4,e7e5,g1f3': ['b8c6', 'b8c6', 'b8c6', 'g8f6', 'd7d6'],
  'e2e4,e7e5,g1f3,b8c6': ['f1b5', 'f1b5', 'f1c4', 'd2d4', 'b1c3'],
  'e2e4,e7e5,g1f3,b8c6,f1b5': ['a7a6', 'g8f6', 'f8c5', 'd7d6'],
  'e2e4,e7e5,g1f3,b8c6,f1c4': ['f8c5', 'g8f6', 'd7d6'],
  'e2e4,e7e5,g1f3,b8c6,d2d4': ['e5d4'],
  'e2e4,e7e5,g1f3,g8f6': ['f3e5', 'b1c3', 'd2d4'],
  'e2e4,e7e5,f1c4': ['g8f6', 'f8c5', 'b8c6'],
  'e2e4,e7e5,b1c3': ['g8f6', 'b8c6', 'f8c5'],

  // 1.e4 c5 (Sicilian)
  'e2e4,c7c5': ['g1f3', 'g1f3', 'b1c3', 'c2c3', 'f2f4'],
  'e2e4,c7c5,g1f3': ['d7d6', 'd7d6', 'b8c6', 'e7e6'],
  'e2e4,c7c5,g1f3,d7d6': ['d2d4', 'f1b5'],
  'e2e4,c7c5,g1f3,b8c6': ['d2d4', 'f1b5', 'b1c3'],
  'e2e4,c7c5,g1f3,e7e6': ['d2d4', 'b1c3', 'c2c3'],

  // 1.e4 e6 (French)
  'e2e4,e7e6': ['d2d4'],
  'e2e4,e7e6,d2d4': ['d7d5'],
  'e2e4,e7e6,d2d4,d7d5': ['b1c3', 'b1d2', 'e4e5', 'e4d5'],

  // 1.e4 c6 (Caro-Kann)
  'e2e4,c7c6': ['d2d4', 'b1c3', 'g1f3'],
  'e2e4,c7c6,d2d4': ['d7d5'],
  'e2e4,c7c6,d2d4,d7d5': ['b1c3', 'b1d2', 'e4e5', 'e4d5'],

  // 1.e4 d5 (Scandinavian)
  'e2e4,d7d5': ['e4d5'],
  'e2e4,d7d5,e4d5': ['d8d5', 'g8f6'],

  // 1.e4 Nf6 (Alekhine)
  'e2e4,g8f6': ['e4e5', 'b1c3', 'd2d3'],

  // ── After 1.d4 ──
  'd2d4': ['d7d5', 'd7d5', 'g8f6', 'g8f6', 'e7e6', 'f7f5'],

  // 1.d4 d5
  'd2d4,d7d5': ['c2c4', 'c2c4', 'g1f3', 'c1f4'],
  'd2d4,d7d5,c2c4': ['e7e6', 'e7e6', 'c7c6', 'd5c4'],
  'd2d4,d7d5,c2c4,e7e6': ['b1c3', 'g1f3', 'c1g5'],
  'd2d4,d7d5,c2c4,c7c6': ['g1f3', 'b1c3', 'e2e3'],
  'd2d4,d7d5,c2c4,d5c4': ['g1f3', 'e2e3', 'e2e4'],
  'd2d4,d7d5,g1f3': ['g8f6', 'e7e6', 'c7c6'],
  'd2d4,d7d5,c1f4': ['g8f6', 'e7e6', 'c7c5'],

  // 1.d4 Nf6 (Indian systems)
  'd2d4,g8f6': ['c2c4', 'c2c4', 'g1f3', 'c1f4'],
  'd2d4,g8f6,c2c4': ['e7e6', 'e7e6', 'g7g6', 'c7c5'],
  'd2d4,g8f6,c2c4,e7e6': ['b1c3', 'g1f3', 'g2g3'],
  'd2d4,g8f6,c2c4,g7g6': ['b1c3', 'g1f3', 'g2g3'],
  'd2d4,g8f6,g1f3': ['d7d5', 'e7e6', 'g7g6'],
  'd2d4,g8f6,c1f4': ['d7d5', 'e7e6', 'c7c5'],

  // 1.d4 e6
  'd2d4,e7e6': ['c2c4', 'g1f3', 'e2e4'],

  // ── After 1.c4 (English) ──
  'c2c4': ['e7e5', 'g8f6', 'c7c5', 'e7e6'],
  'c2c4,e7e5': ['b1c3', 'g1f3', 'g2g3'],
  'c2c4,g8f6': ['b1c3', 'g1f3', 'd2d4'],
  'c2c4,c7c5': ['g1f3', 'b1c3', 'g2g3'],

  // ── After 1.Nf3 (Réti) ──
  'g1f3': ['d7d5', 'g8f6', 'c7c5', 'e7e6'],
  'g1f3,d7d5': ['d2d4', 'c2c4', 'g2g3'],
  'g1f3,g8f6': ['d2d4', 'c2c4', 'g2g3'],
  'g1f3,c7c5': ['c2c4', 'e2e4', 'd2d4'],
};

class ChessAI {
  constructor(engine) {
    this.engine = engine;
    this.nodesSearched = 0;
  }

  evaluate() {
    let score = 0;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = this.engine.board[r][c];
        if (!p) continue;
        const val = PIECE_VALUES[p.t];
        // PST: for white, use row directly; for black, mirror the row
        const pstRow = p.c === 'w' ? r : 7 - r;
        const pst = PST[p.t][pstRow][c];
        if (p.c === 'w') {
          score += val + pst;
        } else {
          score -= val + pst;
        }
      }
    }
    return score;
  }

  // Order moves: captures first (MVV-LVA), then non-captures
  orderMoves(moves) {
    return moves.sort((a, b) => {
      const aCap = this.engine.board[a.tr][a.tc];
      const bCap = this.engine.board[b.tr][b.tc];
      const aScore = aCap ? PIECE_VALUES[aCap.t] - PIECE_VALUES[this.engine.board[a.fr][a.fc].t] / 100 : -1000;
      const bScore = bCap ? PIECE_VALUES[bCap.t] - PIECE_VALUES[this.engine.board[b.fr][b.fc].t] / 100 : -1000;
      return bScore - aScore;
    });
  }

  minimax(depth, alpha, beta, isMaximizing) {
    this.nodesSearched++;

    if (depth === 0) return this.evaluate();

    const color = isMaximizing ? 'w' : 'b';
    let allMoves = this.engine.allLegalMoves(color);

    if (allMoves.length === 0) {
      if (this.engine.isInCheck(color)) {
        return isMaximizing ? -99999 + (100 - depth) : 99999 - (100 - depth);
      }
      return 0; // stalemate
    }

    allMoves = this.orderMoves(allMoves);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of allMoves) {
        // Make move
        const piece = this.engine.board[move.fr][move.fc];
        const captured = this.engine.board[move.tr][move.tc];
        const epCapture = move.flags.enPassant ? this.engine.board[move.fr][move.tc] : null;
        const oldCastling = { ...this.engine.castling };
        const oldEP = this.engine.enPassantTarget;
        const oldTurn = this.engine.turn;

        this.engine.board[move.tr][move.tc] = move.flags.promotion ? { c: piece.c, t: 'q' } : piece;
        this.engine.board[move.fr][move.fc] = null;
        if (move.flags.enPassant) this.engine.board[move.fr][move.tc] = null;
        if (move.flags.castle) {
          const row = piece.c === 'w' ? 7 : 0;
          if (move.flags.castle === 'k') { this.engine.board[row][5] = this.engine.board[row][7]; this.engine.board[row][7] = null; }
          else { this.engine.board[row][3] = this.engine.board[row][0]; this.engine.board[row][0] = null; }
        }
        // Update state
        if (piece.t === 'k') { if (piece.c === 'w') { this.engine.castling.wk = false; this.engine.castling.wq = false; } else { this.engine.castling.bk = false; this.engine.castling.bq = false; } }
        if (piece.t === 'r') { if (move.fr===7&&move.fc===0) this.engine.castling.wq=false; if (move.fr===7&&move.fc===7) this.engine.castling.wk=false; if (move.fr===0&&move.fc===0) this.engine.castling.bq=false; if (move.fr===0&&move.fc===7) this.engine.castling.bk=false; }
        this.engine.enPassantTarget = move.flags.doublePush ? [(move.fr + move.tr) / 2, move.tc] : null;
        this.engine.turn = 'b';

        const eval_ = this.minimax(depth - 1, alpha, beta, false);

        // Undo move
        this.engine.board[move.fr][move.fc] = piece;
        this.engine.board[move.tr][move.tc] = captured;
        if (move.flags.enPassant) this.engine.board[move.fr][move.tc] = epCapture;
        if (move.flags.castle) {
          const row = piece.c === 'w' ? 7 : 0;
          if (move.flags.castle === 'k') { this.engine.board[row][7] = this.engine.board[row][5]; this.engine.board[row][5] = null; }
          else { this.engine.board[row][0] = this.engine.board[row][3]; this.engine.board[row][3] = null; }
        }
        this.engine.castling = oldCastling;
        this.engine.enPassantTarget = oldEP;
        this.engine.turn = oldTurn;

        maxEval = Math.max(maxEval, eval_);
        alpha = Math.max(alpha, eval_);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of allMoves) {
        const piece = this.engine.board[move.fr][move.fc];
        const captured = this.engine.board[move.tr][move.tc];
        const epCapture = move.flags.enPassant ? this.engine.board[move.fr][move.tc] : null;
        const oldCastling = { ...this.engine.castling };
        const oldEP = this.engine.enPassantTarget;
        const oldTurn = this.engine.turn;

        this.engine.board[move.tr][move.tc] = move.flags.promotion ? { c: piece.c, t: 'q' } : piece;
        this.engine.board[move.fr][move.fc] = null;
        if (move.flags.enPassant) this.engine.board[move.fr][move.tc] = null;
        if (move.flags.castle) {
          const row = piece.c === 'w' ? 7 : 0;
          if (move.flags.castle === 'k') { this.engine.board[row][5] = this.engine.board[row][7]; this.engine.board[row][7] = null; }
          else { this.engine.board[row][3] = this.engine.board[row][0]; this.engine.board[row][0] = null; }
        }
        if (piece.t === 'k') { if (piece.c === 'w') { this.engine.castling.wk = false; this.engine.castling.wq = false; } else { this.engine.castling.bk = false; this.engine.castling.bq = false; } }
        if (piece.t === 'r') { if (move.fr===7&&move.fc===0) this.engine.castling.wq=false; if (move.fr===7&&move.fc===7) this.engine.castling.wk=false; if (move.fr===0&&move.fc===0) this.engine.castling.bq=false; if (move.fr===0&&move.fc===7) this.engine.castling.bk=false; }
        this.engine.enPassantTarget = move.flags.doublePush ? [(move.fr + move.tr) / 2, move.tc] : null;
        this.engine.turn = 'w';

        const eval_ = this.minimax(depth - 1, alpha, beta, true);

        this.engine.board[move.fr][move.fc] = piece;
        this.engine.board[move.tr][move.tc] = captured;
        if (move.flags.enPassant) this.engine.board[move.fr][move.tc] = epCapture;
        if (move.flags.castle) {
          const row = piece.c === 'w' ? 7 : 0;
          if (move.flags.castle === 'k') { this.engine.board[row][7] = this.engine.board[row][5]; this.engine.board[row][5] = null; }
          else { this.engine.board[row][0] = this.engine.board[row][3]; this.engine.board[row][3] = null; }
        }
        this.engine.castling = oldCastling;
        this.engine.enPassantTarget = oldEP;
        this.engine.turn = oldTurn;

        minEval = Math.min(minEval, eval_);
        beta = Math.min(beta, eval_);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  getBookMove(botColor) {
    const history = this.engine.moveHistory;
    if (!history) return null;
    const key = history.map(snap => moveToBookStr(snap.move)).join(',');
    const candidates = OPENING_BOOK[key];
    if (!candidates || candidates.length === 0) return null;

    // Pick a random book move
    const bookStr = candidates[Math.floor(Math.random() * candidates.length)];
    const fc = BOOK_FILES.indexOf(bookStr[0]);
    const fr = BOOK_RANKS.indexOf(bookStr[1]);
    const tc = BOOK_FILES.indexOf(bookStr[2]);
    const tr = BOOK_RANKS.indexOf(bookStr[3]);

    // Find matching legal move
    const legalMoves = this.engine.allLegalMoves(botColor);
    return legalMoves.find(m => m.fr === fr && m.fc === fc && m.tr === tr && m.tc === tc) || null;
  }

  getBestMove(depth, botColor) {
    // Check opening book first
    const bookMove = this.getBookMove(botColor);
    if (bookMove) {
      console.log('AI playing book move');
      return bookMove;
    }

    this.nodesSearched = 0;
    const isMaximizing = botColor === 'w';
    let allMoves = this.engine.allLegalMoves(botColor);
    if (allMoves.length === 0) return null;

    allMoves = this.orderMoves(allMoves);

    const evaluated = [];

    for (const move of allMoves) {
      const piece = this.engine.board[move.fr][move.fc];
      const captured = this.engine.board[move.tr][move.tc];
      const epCapture = move.flags.enPassant ? this.engine.board[move.fr][move.tc] : null;
      const oldCastling = { ...this.engine.castling };
      const oldEP = this.engine.enPassantTarget;
      const oldTurn = this.engine.turn;

      this.engine.board[move.tr][move.tc] = move.flags.promotion ? { c: piece.c, t: 'q' } : piece;
      this.engine.board[move.fr][move.fc] = null;
      if (move.flags.enPassant) this.engine.board[move.fr][move.tc] = null;
      if (move.flags.castle) {
        const row = piece.c === 'w' ? 7 : 0;
        if (move.flags.castle === 'k') { this.engine.board[row][5] = this.engine.board[row][7]; this.engine.board[row][7] = null; }
        else { this.engine.board[row][3] = this.engine.board[row][0]; this.engine.board[row][0] = null; }
      }
      if (piece.t === 'k') { if (piece.c === 'w') { this.engine.castling.wk = false; this.engine.castling.wq = false; } else { this.engine.castling.bk = false; this.engine.castling.bq = false; } }
      if (piece.t === 'r') { if (move.fr===7&&move.fc===0) this.engine.castling.wq=false; if (move.fr===7&&move.fc===7) this.engine.castling.wk=false; if (move.fr===0&&move.fc===0) this.engine.castling.bq=false; if (move.fr===0&&move.fc===7) this.engine.castling.bk=false; }
      this.engine.enPassantTarget = move.flags.doublePush ? [(move.fr + move.tr) / 2, move.tc] : null;
      this.engine.turn = isMaximizing ? 'b' : 'w';

      const eval_ = this.minimax(depth - 1, -Infinity, Infinity, !isMaximizing);

      this.engine.board[move.fr][move.fc] = piece;
      this.engine.board[move.tr][move.tc] = captured;
      if (move.flags.enPassant) this.engine.board[move.fr][move.tc] = epCapture;
      if (move.flags.castle) {
        const row = piece.c === 'w' ? 7 : 0;
        if (move.flags.castle === 'k') { this.engine.board[row][7] = this.engine.board[row][5]; this.engine.board[row][5] = null; }
        else { this.engine.board[row][0] = this.engine.board[row][3]; this.engine.board[row][3] = null; }
      }
      this.engine.castling = oldCastling;
      this.engine.enPassantTarget = oldEP;
      this.engine.turn = oldTurn;

      evaluated.push({ move, eval: eval_ });
    }

    // Sort best first
    evaluated.sort((a, b) => isMaximizing ? b.eval - a.eval : a.eval - b.eval);

    // Pick randomly among moves within 15 centipawns of the best
    const bestEval = evaluated[0].eval;
    const topMoves = evaluated.filter(m => Math.abs(m.eval - bestEval) <= 15);
    const chosen = topMoves[Math.floor(Math.random() * topMoves.length)];

    console.log(`AI searched ${this.nodesSearched} nodes, eval: ${chosen.eval}, top moves: ${topMoves.length}`);
    return chosen.move;
  }
}
