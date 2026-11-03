"use client";

import React, { useState } from "react";
import {
  useCollab,
  COLLAB_COLORS,
  COLLAB_SERVER_PRESETS,
  type CollabUser,
} from "../../../providers/CollabContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../../ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../../ui/popover";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import {
  Users,
  Wifi,
  WifiOff,
  Copy,
  Check,
  Share2,
  Settings2,
  Sparkles,
  HardDrive,
  MessageSquare,
  History,
  ArrowDownUp,
  RefreshCw,
  Database,
  Cloud,
  AlertTriangle,
} from "lucide-react";
import { useComments } from "../../../providers/CommentsContext";
import { useVersionHistory } from "../../../providers/VersionHistoryContext";
import { cn } from "../../../../lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const AVATAR_PRESETS = [
  "🦊", "🚀", "💡", "🎨", "⚡", "🍀",
  "🦉", "💎", "🐱", "🐼", "🌟", "🔥",
];

function formatLastSavedRelative(timestamp: number | null): string {
  if (!timestamp) return "Never";
  const sec = Math.floor((Date.now() - timestamp) / 1000);
  if (sec < 5) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

interface CollaboratorsBarProps {
  className?: string;
  showRoomInfo?: boolean;
}

export default function CollaboratorsBar({
  className,
  showRoomInfo = true,
}: CollaboratorsBarProps) {
  const {
    enabled,
    toggleEnabled,
    status,
    users,
    docId,
    serverUrl,
    setServerUrl,
    username,
    cursorColor,
    avatar,
    offlineStorageStatus,
    updateUser,
    isOnline,
    pendingUpdatesCount,
    lastSavedTimestamp,
    reconnectCountdown,
    manualReconnect,
    clearLocalPersistence,
  } = useCollab();

  const { toggleSidebar, isSidebarOpen, unresolvedCount } = useComments();
  const { toggleDrawer: toggleHistoryDrawer, isDrawerOpen: isHistoryDrawerOpen } = useVersionHistory();

  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [editingName, setEditingName] = useState(username);
  const [selectedColor, setSelectedColor] = useState(cursorColor);
  const [selectedAvatar, setSelectedAvatar] = useState(avatar || "");
  const [customServer, setCustomServer] = useState(serverUrl);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    setEditingName((prev) => (prev !== username ? username : prev));
  }, [username]);

  React.useEffect(() => {
    setSelectedColor((prev) => (prev !== cursorColor ? cursorColor : prev));
  }, [cursorColor]);

  React.useEffect(() => {
    setSelectedAvatar((prev) => (prev !== (avatar || "") ? (avatar || "") : prev));
  }, [avatar]);

  React.useEffect(() => {
    setCustomServer((prev) => (prev !== serverUrl ? serverUrl : prev));
  }, [serverUrl]);

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("room", docId);
    url.searchParams.set("collab", "true");
    if (serverUrl) {
      url.searchParams.set("server", serverUrl);
    }

    navigator.clipboard.writeText(url.toString()).then(() => {
      setCopied(true);
      toast.success("Collaboration link copied to clipboard!", {
        description: `Invite collaborators to join room: ${docId} on ${serverUrl.includes("localhost") ? "Local server" : "Public Cloud"}`,
      });
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(editingName, selectedColor, selectedAvatar);
    if (customServer && customServer !== serverUrl) {
      setServerUrl(customServer);
      toast.success("Server endpoint updated", {
        description: `Connected to ${customServer}`,
      });
    } else {
      toast.success("Profile updated", {
        description: `Collaborating as ${editingName}`,
      });
    }
  };

  const maxVisibleAvatars = 4;
  const visibleUsers = users.slice(0, maxVisibleAvatars);
  const remainingCount = users.length - maxVisibleAvatars;
  const typingUsers = users.filter((u) => !u.isSelf && u.isTyping);

  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full",
          "bg-background/80 backdrop-blur-md border border-border/60 shadow-sm",
          "text-xs font-medium transition-all duration-200 select-none opacity-60",
          className
        )}
      >
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        <span className="text-muted-foreground text-xs font-medium">Collab</span>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full",
          "bg-background/80 backdrop-blur-md border border-border/60 shadow-sm",
          "text-xs font-medium transition-all duration-200 select-none",
          className
        )}
      >
        {/* Connection status indicator */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                if (status === "disconnected" || status === "offline") {
                  manualReconnect();
                } else {
                  toggleEnabled();
                }
              }}
              className={cn(
                "flex items-center gap-1.5 px-2 py-0.5 rounded-full transition-all cursor-pointer select-none",
                status === "connected" && "hover:bg-emerald-500/10",
                status === "connecting" && "bg-amber-500/10 text-amber-600 dark:text-amber-400",
                (status === "disconnected" || status === "offline") && "hover:bg-muted/80 text-muted-foreground"
              )}
              aria-label={
                status === "connected"
                  ? "Collaboration connected. Click to pause sync"
                  : "Click to reconnect collaboration"
              }
            >
              {status === "connected" && (
                <>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium hidden sm:inline">
                    Live
                  </span>
                </>
              )}

              {status === "connecting" && (
                <>
                  <RefreshCw className="h-2.5 w-2.5 text-amber-500 animate-spin shrink-0" />
                  <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                    {reconnectCountdown !== null
                      ? `Retry ${reconnectCountdown}s`
                      : "Connecting..."}
                  </span>
                  {pendingUpdatesCount > 0 && (
                    <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-500/20 font-bold font-mono">
                      +{pendingUpdatesCount}
                    </span>
                  )}
                </>
              )}

              {status === "disconnected" && (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500/80 shrink-0" />
                  <span className="text-muted-foreground hover:text-foreground text-[11px]">
                    {reconnectCountdown !== null ? `Retry in ${reconnectCountdown}s` : "Reconnect"}
                  </span>
                  {pendingUpdatesCount > 0 && (
                    <span className="text-[9px] px-1 py-0.2 rounded-full bg-amber-500/20 font-bold font-mono">
                      +{pendingUpdatesCount}
                    </span>
                  )}
                </>
              )}

              {status === "offline" && (
                <>
                  <WifiOff className="h-2.5 w-2.5 text-muted-foreground/70 shrink-0" />
                  <span className="text-muted-foreground hidden sm:inline">Offline</span>
                </>
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {status === "connected"
              ? `Connected & synced to ${serverUrl} (Click to pause sync)`
              : status === "disconnected"
              ? `Disconnected. Click to reconnect now (${pendingUpdatesCount} offline edits saved)`
              : !isOnline
              ? "You are working offline. Edits are saved locally to IndexedDB."
              : `Status: ${status}`}
          </TooltipContent>
        </Tooltip>

        {/* Offline IndexedDB persistence inspector popover */}
        {offlineStorageStatus === "synced" && (
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-muted-foreground/80 hover:text-foreground px-1.5 py-0.5 rounded-full hover:bg-muted/80 transition-colors cursor-pointer"
                    aria-label="Inspect offline storage and sync health"
                  >
                    <HardDrive className="h-3 w-3 text-emerald-500" />
                    {pendingUpdatesCount > 0 ? (
                      <span className="text-[10px] font-mono font-bold text-amber-500 hidden sm:inline">
                        {pendingUpdatesCount}
                      </span>
                    ) : (
                      <Check className="h-2.5 w-2.5 text-emerald-500 hidden sm:inline" />
                    )}
                  </button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                Offline Persistence: All changes saved to IndexedDB
              </TooltipContent>
            </Tooltip>

            <PopoverContent side="bottom" align="end" className="w-80 p-3.5 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-1.5 border-b border-border/70">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Database className="h-4 w-4 text-emerald-500" />
                  <span>Storage & Sync Health</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                  IndexedDB
                </span>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground">Local Document Cache:</span>
                  <span className="font-semibold text-foreground font-mono">#{docId}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground">Last Saved Locally:</span>
                  <span className="font-medium text-foreground">
                    {formatLastSavedRelative(lastSavedTimestamp)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground">Pending Cloud Sync:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      pendingUpdatesCount === 0 ? "text-emerald-500" : "text-amber-500"
                    )}
                  >
                    {pendingUpdatesCount === 0
                      ? "100% Synced"
                      : `${pendingUpdatesCount} offline changes pending`}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/50">
                  <span className="text-muted-foreground">Browser Network:</span>
                  <span className="flex items-center gap-1 font-medium">
                    {isOnline ? (
                      <>
                        <Wifi className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Online</span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-red-500" />
                        <span className="text-red-500">Offline</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearLocalPersistence}
                  className="text-[11px] h-7 px-2 text-destructive hover:text-destructive"
                >
                  Clear Cache
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={manualReconnect}
                  disabled={status === "connected"}
                  className="text-[11px] h-7 px-3 gap-1 cursor-pointer"
                >
                  <RefreshCw className="h-3 w-3" />
                  {status === "connected" ? "Connected" : "Sync Now"}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Room badge & Share action */}
        {enabled && showRoomInfo && (
          <>
            <div className="h-3.5 w-px bg-border/70 hidden sm:block" />

            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="font-mono text-[11px] truncate max-w-[80px] sm:max-w-[110px] hidden md:inline"
                suppressHydrationWarning
              >
                #{docId}
              </span>
              <span
                className="text-[9px] px-1 py-0.2 rounded font-sans uppercase font-bold tracking-wider bg-muted text-muted-foreground border border-border/50 hidden md:inline-block"
                title={`Active collaboration server: ${serverUrl}`}
              >
                {serverUrl.includes("localhost") || serverUrl.includes("127.0.0.1")
                  ? "Local"
                  : "Cloud"}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyLink}
                    className="h-6 w-6 p-0 hover:bg-muted rounded-full"
                    aria-label="Copy collaboration room link"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Share2 className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Copy shareable invite link
                </TooltipContent>
              </Tooltip>
            </div>
          </>
        )}

        {/* Collaborators Avatar Stack */}
        {enabled && users.length > 0 && (
          <>
            <div className="h-3.5 w-px bg-border/70" />

            <div className="flex items-center -space-x-1.5 overflow-hidden pl-1">
              <AnimatePresence mode="popLayout">
                {visibleUsers.map((user, idx) => (
                  <Tooltip key={user.clientId}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.7, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          "relative flex items-center justify-center h-6.5 w-6.5 min-w-[26px] min-h-[26px] rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-background transition-transform hover:scale-115 hover:z-20 select-none",
                          user.isSelf && "ring-emerald-500/60",
                          idx >= 2 && "hidden sm:flex"
                        )}
                        style={{ backgroundColor: user.color }}
                      >
                        {user.avatar ? (
                          user.avatar.startsWith("http") || user.avatar.startsWith("data:") ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xs leading-none">{user.avatar}</span>
                          )
                        ) : (
                          getInitials(user.name)
                        )}
                        {user.isTyping && (
                          <span
                            className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-amber-400 ring-1 ring-background"
                            title="Typing..."
                          >
                            <span className="h-1 w-1 rounded-full bg-slate-900 animate-ping" />
                          </span>
                        )}
                        {user.isSelf && !user.isTyping && (
                          <span
                            className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-background bg-emerald-500"
                            title="You"
                          />
                        )}
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: user.color }}
                        />
                        <span>{user.name}</span>
                        {user.isSelf && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                            You
                          </span>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </AnimatePresence>

              {remainingCount > 0 && (
                <div
                  className="flex items-center justify-center h-6.5 w-6.5 min-w-[26px] min-h-[26px] rounded-full bg-muted text-muted-foreground text-[10px] font-semibold ring-2 ring-background"
                  title={`${remainingCount} more collaborators`}
                >
                  +{remainingCount}
                </div>
              )}

              {users.length > 1 && (
                <span className="text-[11px] font-semibold text-muted-foreground ml-1.5 hidden sm:inline" title={`${users.length} active collaborators`}>
                  {users.length} online
                </span>
              )}

              {typingUsers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, x: -4 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -4 }}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium ml-1"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full animate-ping"
                    style={{ backgroundColor: typingUsers[0].color }}
                  />
                  <span className="truncate max-w-[130px]">
                    {typingUsers.length === 1
                      ? `${typingUsers[0].name} is typing...`
                      : `${typingUsers.length} typing...`}
                  </span>
                </motion.div>
              )}
            </div>
          </>
        )}

        {/* User profile customize popover */}
        {enabled && (
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted rounded-full ml-0.5"
                    aria-label="Collaborator settings"
                  >
                    <Settings2 className="h-3 w-3 text-muted-foreground hover:text-foreground transition-colors" />
                  </Button>
                </PopoverTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom">Change name & cursor color</TooltipContent>
            </Tooltip>

            <PopoverContent side="bottom" align="end" className="w-72 p-4">
              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                    <span>Collaborator Profile</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Real-time presence
                  </span>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="collab-name" className="text-xs font-medium">
                    Display Name
                  </Label>
                  <Input
                    id="collab-name"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Enter your name..."
                    maxLength={24}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">Avatar Badge</Label>
                    {selectedAvatar && (
                      <button
                        type="button"
                        onClick={() => setSelectedAvatar("")}
                        className="text-[10px] text-muted-foreground hover:text-foreground"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-6 gap-1 pt-0.5">
                    {AVATAR_PRESETS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedAvatar(emoji)}
                        className={cn(
                          "h-7 rounded-md border text-sm transition-all flex items-center justify-center hover:scale-110",
                          selectedAvatar === emoji
                            ? "border-primary bg-primary/10 shadow-xs"
                            : "border-border/60 bg-muted/30 opacity-80 hover:opacity-100"
                        )}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Cursor Color</Label>
                  <div className="grid grid-cols-5 gap-1.5 pt-0.5">
                    {COLLAB_COLORS.map((col) => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setSelectedColor(col)}
                        className={cn(
                          "h-6 w-full rounded-md transition-all flex items-center justify-center",
                          selectedColor === col
                            ? "ring-2 ring-offset-2 ring-primary scale-105"
                            : "hover:scale-105 opacity-85 hover:opacity-100"
                        )}
                        style={{ backgroundColor: col }}
                      >
                        {selectedColor === col && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-1 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="collab-server" className="text-xs font-medium">
                      Collab Server
                    </Label>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                      {serverUrl.includes("localhost") ? "Local (Self-Hosted)" : "Cloud"}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {COLLAB_SERVER_PRESETS.map((preset) => {
                      const isActive = serverUrl === preset.url;
                      return (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => {
                            setCustomServer(preset.url);
                            setServerUrl(preset.url);
                            toast.success(`Switched to ${preset.label.split(" ")[0]} server`);
                          }}
                          className={cn(
                            "flex-1 text-[10px] py-1 px-1.5 rounded border transition-all text-center",
                            isActive
                              ? "bg-primary/10 border-primary/50 text-primary font-medium"
                              : "bg-muted/40 border-border/60 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          {preset.label.includes("Local") ? "Local :4444" : "Public Cloud"}
                        </button>
                      );
                    })}
                  </div>
                  <Input
                    id="collab-server"
                    value={customServer}
                    onChange={(e) => setCustomServer(e.target.value)}
                    placeholder="ws://localhost:4444"
                    className="h-7 text-[11px] font-mono"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="h-7 px-3 text-xs"
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </PopoverContent>
          </Popover>
        )}

        {/* Discussions & Comments Drawer Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className={cn(
                "h-6 px-1.5 gap-1 hover:bg-muted rounded-full ml-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                isSidebarOpen && "bg-muted text-foreground"
              )}
              aria-label="Toggle discussions"
            >
              <MessageSquare className="h-3 w-3" />
              {unresolvedCount > 0 && (
                <span className="h-3.5 min-w-[14px] px-1 rounded-full text-[9px] font-bold bg-primary text-primary-foreground flex items-center justify-center">
                  {unresolvedCount}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isSidebarOpen ? "Close comments panel" : `Discussions (${unresolvedCount} open)`}
          </TooltipContent>
        </Tooltip>

        {/* Version History Drawer Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleHistoryDrawer}
              className={cn(
                "h-6 w-6 p-0 hover:bg-muted rounded-full ml-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer",
                isHistoryDrawerOpen && "bg-muted text-foreground"
              )}
              aria-label="Version history"
            >
              <History className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            {isHistoryDrawerOpen ? "Close version history" : "Version history (Ctrl+Shift+H)"}
          </TooltipContent>
        </Tooltip>

        {/* Import & Export Hub Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(
                    new CustomEvent("notiq:open-import-export", {
                      detail: { defaultTab: "export" },
                    })
                  );
                }
              }}
              className="h-6 w-6 p-0 hover:bg-muted rounded-full ml-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Import & Export document"
            >
              <ArrowDownUp className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Import / Export Hub (Ctrl+Shift+E)
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export function OfflineBanner() {
  const { isOnline, status, manualReconnect, pendingUpdatesCount } = useCollab();

  if (isOnline && status !== "offline") return null;

  return (
    <div className="bg-amber-500/15 border-b border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 font-medium animate-in fade-in duration-200 select-none">
      <WifiOff className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
      <span>
        You are currently offline. Edits are saved locally in IndexedDB
        {pendingUpdatesCount > 0 ? ` (${pendingUpdatesCount} offline edits pending)` : ""} and will automatically sync when reconnected.
      </span>
      <button
        type="button"
        onClick={manualReconnect}
        className="underline hover:no-underline font-semibold ml-1 cursor-pointer text-foreground hover:text-primary transition-colors"
      >
        Retry Sync
      </button>
    </div>
  );
}
