"use client";

import Image from "next/image";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  Lock,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  PanelLeftOpen,
  PanelRightOpen,
  Palette,
  ShoppingBag,
  Store,
  User,
  X,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useNotifications } from "./notifications-provider";

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
  locked: boolean;
  lockedTooltip?: string;
};

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

const getNavItems = (
  hasSampleOrders: boolean,
  hasDeliveredOrder: boolean
): NavItem[] => [
  {
    label: "Design",
    icon: Palette,
    href: "/design",
    locked: false, // Always unlocked
  },
  {
    label: "Sample Orders",
    icon: Package,
    href: "/sample-orders",
    locked: !hasSampleOrders, // Unlocked when user has submitted sample orders
    lockedTooltip:
      "Once you request a sample, you will be able to view your samples.",
  },
  {
    label: "Store",
    icon: Store,
    href: "/store",
    locked: !hasDeliveredOrder, // Unlocked when user has a delivered order
    lockedTooltip:
      "Once a sample is delivered, you will be able to create your store.",
  },
];

// Tooltip component using state for positioning
function TooltipButton({
  children,
  label,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
    }
    setShow(true);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShow(false)}
        className={className}
      >
        {children}
      </button>
      {show && (
        <div
          className="fixed z-[9999] -translate-y-1/2 pointer-events-none"
          style={{ top: position.top, left: position.left }}
        >
          <div className="whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white shadow-lg">
            {label}
          </div>
        </div>
      )}
    </>
  );
}

// User popup component
function UserPopup({
  isOpen,
  onClose,
  position,
  onSignOut,
  onProfilePage,
  triggerRef,
}: {
  isOpen: boolean;
  onClose: () => void;
  position: "above" | "below";
  onSignOut?: () => void;
  onProfilePage?: () => void;
  triggerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const isOutsidePopup =
        popupRef.current && !popupRef.current.contains(target);
      const isOutsideTrigger =
        !triggerRef?.current || !triggerRef.current.contains(target);

      if (isOutsidePopup && isOutsideTrigger) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className={`absolute left-0 right-0 z-50 mx-2 rounded-xl bg-white border border-slate-200 shadow-lg overflow-hidden ${
        position === "above" ? "bottom-full mb-2" : "top-full mt-2"
      }`}
    >
      <button
        onClick={() => {
          onProfilePage?.();
          onClose();
        }}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-slate-700 transition hover:bg-slate-50"
      >
        <User className="h-4 w-4" />
        <span>Profile Page</span>
      </button>
      <div className="border-t border-slate-100" />
      <button
        onClick={() => {
          onSignOut?.();
          onClose();
        }}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />
        <span>Sign Out</span>
      </button>
    </div>
  );
}

type SidebarProps = {
  isOpen?: boolean;
  onToggle?: () => void;
  onProfilePage?: () => void;
  user?: {
    firstName: string | null;
    lastName: string | null;
    pfpSrc: string | null;
  } | null;
  cartCount?: number;
  hasSampleOrders?: boolean;
  hasDeliveredOrder?: boolean;
};

export default function Sidebar({
  isOpen = false,
  onToggle,
  onProfilePage,
  user,
  cartCount = 0,
  hasSampleOrders = false,
  hasDeliveredOrder = false,
}: SidebarProps) {
  const navItems = getNavItems(hasSampleOrders, hasDeliveredOrder);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userPopupOpen, setUserPopupOpen] = useState(false);
  const [mobileUserPopupOpen, setMobileUserPopupOpen] = useState(false);
  const [notificationsMode, setNotificationsMode] = useState(false);

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    hasMore,
    loadMore,
    markAsRead,
    dismiss,
    clearAll,
  } = useNotifications();
  const userTriggerRef = useRef<HTMLDivElement>(null);
  const mobileUserTriggerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fullName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User"
    : "User";
  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() ||
      "U"
    : "U";

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setUserPopupOpen(false);
        setMobileUserPopupOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Shared nav content for both mobile and desktop
  const NavContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {/* Notifications Button */}
      <button
        onClick={() => setNotificationsMode(true)}
        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition text-slate-900 hover:bg-slate-100"
      >
        <Bell className="h-5 w-5 shrink-0 text-slate-500" />
        <span>Notifications</span>
        {unreadCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* My Samples standalone link */}
      <Link
        href="/samples"
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
          pathname === "/samples"
            ? "bg-orange-50 text-orange-600"
            : "text-slate-900 hover:bg-slate-100"
        }`}
      >
        <div className="relative">
          <ShoppingBag
            className={`h-5 w-5 shrink-0 ${
              pathname === "/samples" ? "text-orange-500" : "text-slate-500"
            }`}
          />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-semibold text-white">
              {cartCount > 9 ? "9+" : cartCount}
            </span>
          )}
        </div>
        <span className="flex-1">My Samples</span>
        {cartCount > 0 && (
          <span className="text-xs text-slate-400">{cartCount}</span>
        )}
      </Link>

      {/* Separator */}
      <div className="my-3 border-t border-slate-200" />

      {/* Nav items */}
      {navItems.map((item: NavItem) => {
        const ItemIcon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(item.href + "/");

        if (item.locked) {
          return (
            <div key={item.label} className="relative group mb-1">
              <div className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 cursor-not-allowed">
                <ItemIcon className="h-5 w-5 shrink-0 text-slate-300" />
                <span className="flex-1">{item.label}</span>
                <Lock className="h-4 w-4 text-slate-300" />
              </div>
              {item.lockedTooltip && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50 hidden group-hover:block">
                  <div className="whitespace-nowrap max-w-xs text-wrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-lg">
                    {item.lockedTooltip}
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => isMobile && setMobileMenuOpen(false)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition mb-1 ${
              isActive
                ? "bg-orange-50 text-orange-600"
                : "text-slate-900 hover:bg-slate-100"
            }`}
          >
            <ItemIcon
              className={`h-5 w-5 shrink-0 ${
                isActive ? "text-orange-500" : "text-slate-500"
              }`}
            />
            <span className="flex-1">{item.label}</span>
          </Link>
        );
      })}
    </>
  );

  // Notifications content component
  const NotificationsContent = ({
    isMobile = false,
  }: {
    isMobile?: boolean;
  }) => {
    const handleNotificationClick = (
      notification: (typeof notifications)[0]
    ) => {
      markAsRead(notification.id);
      setNotificationsMode(false);
      if (isMobile) setMobileMenuOpen(false);
      if (notification.redirect_url) {
        router.push(notification.redirect_url);
      }
    };

    const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
        loadMore();
      }
    };

    return (
      <div className="flex flex-col h-full">
        {/* Header with back button */}
        <div className="flex items-center gap-3 px-3 pb-4">
          <button
            onClick={() => setNotificationsMode(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600" />
          </button>
          <span className="text-sm font-semibold text-slate-900 flex-1">
            Notifications
          </span>
          {notifications.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Clear all notifications?")) clearAll();
              }}
              className="text-xs text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto -mx-3" onScroll={onScroll}>
          {notificationsLoading && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              Loading...
            </div>
          )}

          {!notificationsLoading && notifications.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              You&apos;re all caught up.
            </div>
          )}

          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-slate-50 ${
                !notification.is_read
                  ? "bg-orange-50 border-l-2 border-l-orange-400"
                  : ""
              }`}
            >
              {notification.sender_pfp_src ? (
                <Image
                  src={notification.sender_pfp_src}
                  alt="Sender"
                  width={32}
                  height={32}
                  className="h-8 w-8 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  <MessageSquare className="h-4 w-4" />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-900 line-clamp-2">
                  {notification.message || "New notification"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {timeAgo(notification.createdAt)}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dismiss(notification.id);
                }}
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          {!notificationsLoading && hasMore && (
            <div className="px-4 py-2 text-center text-xs text-slate-400">
              Scroll to load more
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
        >
          <Menu className="h-5 w-5 text-slate-600" />
        </button>

        <span className="text-lg font-semibold text-slate-900">TerraForm</span>

        {/* Notifications Bell - opens mobile menu in notifications mode */}
        <button
          onClick={() => {
            setNotificationsMode(true);
            setMobileMenuOpen(true);
          }}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
        >
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Dropdown Panel */}
          <div className="absolute left-0 right-0 top-0 max-h-[85vh] overflow-y-auto rounded-b-2xl bg-white shadow-xl animate-in slide-in-from-top duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-1">
                <Image
                  src="https://images.useterra.com/logo/1766471182424-2upmie.webp"
                  alt="Terra"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
                <span className="text-lg font-semibold text-slate-900">
                  TerraForm
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-600" />
              </button>
            </div>

            {/* Nav Content with animated transitions */}
            <div className="p-3 flex-1 overflow-hidden relative">
              {/* Nav Content */}
              <div
                className={`h-full overflow-y-auto transition-all duration-300 ease-in-out ${
                  notificationsMode
                    ? "-translate-x-full opacity-0 absolute inset-0 p-3 pointer-events-none"
                    : "translate-x-0 opacity-100"
                }`}
              >
                <NavContent isMobile />
              </div>

              {/* Notifications Content */}
              <div
                className={`h-full overflow-y-auto transition-all duration-300 ease-in-out ${
                  notificationsMode
                    ? "translate-x-0 opacity-100"
                    : "translate-x-full opacity-0 absolute inset-0 p-3 pointer-events-none"
                }`}
              >
                <NotificationsContent isMobile />
              </div>
            </div>

            {/* Footer */}
            <div className="relative border-t border-slate-100 p-3">
              <div
                ref={mobileUserTriggerRef}
                onClick={() => setMobileUserPopupOpen(!mobileUserPopupOpen)}
                className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition hover:bg-slate-50"
              >
                {user?.pfpSrc ? (
                  <Image
                    src={user.pfpSrc}
                    alt={fullName}
                    width={36}
                    height={36}
                    className="h-9 w-9 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                    {initials}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {fullName}
                  </p>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                    mobileUserPopupOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              <UserPopup
                isOpen={mobileUserPopupOpen}
                onClose={() => setMobileUserPopupOpen(false)}
                position="above"
                onSignOut={handleSignOut}
                onProfilePage={onProfilePage}
                triggerRef={mobileUserTriggerRef}
              />
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar - hidden on mobile */}
      {/* Floating open button - visible when collapsed, hidden on root page */}
      <div
        className={`hidden md:block fixed top-5 left-3 z-50 transition-all duration-300 ease-in-out ${
          isOpen || pathname === "/"
            ? "opacity-0 pointer-events-none -translate-x-4"
            : "opacity-100 pointer-events-auto translate-x-0"
        }`}
      >
        <TooltipButton
          label="Open sidebar"
          onClick={onToggle}
          className="group relative flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md border border-slate-200 transition hover:bg-slate-50"
        >
          <Image
            src="https://images.useterra.com/logo/1766471182424-2upmie.webp"
            alt="Terra"
            width={28}
            height={28}
            className="h-7 w-7 object-contain transition-opacity duration-200 group-hover:opacity-0"
          />
          <PanelLeftOpen className="absolute h-5 w-5 text-slate-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          {/* Notification Badge on Logo */}
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </TooltipButton>
      </div>

      {/* Main sidebar - slides in/out */}
      <aside
        className={`hidden md:flex h-screen w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white py-5 px-3 transition-all duration-300 ease-in-out ${
          isOpen
            ? "translate-x-0 opacity-100"
            : "-translate-x-full opacity-0 absolute"
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between px-2 pb-6">
          <button
            onClick={onToggle}
            className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
          >
            <Image
              src="https://images.useterra.com/logo/1766471182424-2upmie.webp"
              alt="Terra"
              width={28}
              height={28}
              className="h-7 w-7 object-contain transition-opacity duration-200 group-hover:opacity-0"
              priority
            />
            <PanelRightOpen className="absolute h-5 w-5 text-slate-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
          </button>

          <span className="text-lg font-semibold text-slate-900">
            TerraForm
          </span>

          {/* Empty spacer for alignment */}
          <div className="w-10" />
        </div>

        {/* Scrollable content with animated transitions */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden relative">
          {/* Nav Content */}
          <div
            className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
              notificationsMode
                ? "-translate-x-full opacity-0 absolute inset-0 pointer-events-none"
                : "translate-x-0 opacity-100"
            }`}
          >
            <NavContent />
          </div>

          {/* Notifications Content */}
          <div
            className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out ${
              notificationsMode
                ? "translate-x-0 opacity-100"
                : "translate-x-full opacity-0 absolute inset-0 pointer-events-none"
            }`}
          >
            <NotificationsContent />
          </div>
        </div>

        {/* Profile section - fixed at bottom */}
        <div className="relative shrink-0 border-t border-slate-100 pt-3">
          <div
            ref={userTriggerRef}
            onClick={() => setUserPopupOpen(!userPopupOpen)}
            className="flex items-center gap-3 rounded-xl px-3 py-2 cursor-pointer transition hover:bg-slate-50"
          >
            {user?.pfpSrc ? (
              <Image
                src={user.pfpSrc}
                alt={fullName}
                width={36}
                height={36}
                className="h-9 w-9 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-semibold text-white">
                {initials}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {fullName}
              </p>
            </div>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                userPopupOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          <UserPopup
            isOpen={userPopupOpen}
            onClose={() => setUserPopupOpen(false)}
            position="above"
            onSignOut={handleSignOut}
            onProfilePage={onProfilePage}
            triggerRef={userTriggerRef}
          />
        </div>
      </aside>
    </>
  );
}
