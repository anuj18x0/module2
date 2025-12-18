import mongoose, { Schema, Document, Model } from 'mongoose';
import crypto from 'crypto';

export interface IUser extends Document {
  email: string;
  metaUserId?: string;
  userName?: string;
  encryptedAccessToken: string;
  tokenExpiry: Date;
  tokenRefreshedAt?: Date;
  pageId?: string;
  pageName?: string;
  igBusinessId?: string;
  igUsername?: string;
  permissions?: string[];
  
  pages?: Array<{
    pageId: string;
    pageName: string;
    encryptedPageToken: string;
    category?: string;
    igBusinessId?: string;
    igUsername?: string;
  }>;
  activePageId?: string;
  
  lastActivity?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  getDecryptedToken(): string;
  setEncryptedToken(token: string): void;
  getActivePage(): any;
  isTokenExpired(): boolean;
}

const UserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    metaUserId: {
      type: String,
      sparse: true,
      index: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    encryptedAccessToken: {
      type: String,
      default: '',
      select: false,
    },
    tokenExpiry: {
      type: Date,
      required: true,
      index: true,
    },
    tokenRefreshedAt: {
      type: Date,
      default: Date.now,
    },
    pageId: {
      type: String,
      index: true,
    },
    pageName: {
      type: String,
      trim: true,
    },
    igBusinessId: {
      type: String,
      sparse: true,
    },
    igUsername: {
      type: String,
      trim: true,
    },
    permissions: [{
      type: String,
    }],
    pages: [{
      pageId: { type: String, required: true },
      pageName: { type: String },
      encryptedPageToken: { type: String, select: false },
      category: { type: String },
      igBusinessId: { type: String },
      igUsername: { type: String },
    }],
    activePageId: {
      type: String,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Encryption settings
const ENCRYPTION_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'realty-genie-secret-key-32-chars!!';
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Helper function to ensure 32-byte key
function getEncryptionKey(): Buffer {
  const key = ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0');
  return Buffer.from(key);
}

// Encrypt token
function encryptToken(token: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// Decrypt token
function decryptToken(encryptedData: string): string {
  const [ivHex, encryptedToken] = encryptedData.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
  let decrypted = decipher.update(encryptedToken, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Instance methods
UserSchema.methods.getDecryptedToken = function(): string {
  if (!this.encryptedAccessToken) return '';
  return decryptToken(this.encryptedAccessToken);
};

UserSchema.methods.setEncryptedToken = function(token: string): void {
  this.encryptedAccessToken = encryptToken(token);
};

UserSchema.methods.getActivePage = function() {
  if (!this.activePageId || !this.pages || this.pages.length === 0) {
    return null;
  }
  return this.pages.find((page: any) => page.pageId === this.activePageId);
};

UserSchema.methods.isTokenExpired = function(): boolean {
  return this.tokenExpiry < new Date();
};

// Index for efficient queries
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ tokenExpiry: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
