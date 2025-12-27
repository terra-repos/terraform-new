"use client";

import Image from "next/image";
import {
  ChevronDown,
  Lock,
  LogOut,
  Menu,
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

type NavItem = {
  label: string;
  icon: React.ElementType;
  href: string;
  locked: boolean;
  lockedTooltip?: string;
};

const getNavItems = (hasSampleOrders: boolean): NavItem[] => [
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
    locked: true,
    lockedTooltip:
      "Once a sample is finalized, you will be able to create your store.",
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
};

export default function Sidebar({
  isOpen = true,
  onToggle,
  onProfilePage,
  user,
  cartCount = 0,
  hasSampleOrders = false,
}: SidebarProps) {
  const navItems = getNavItems(hasSampleOrders);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userPopupOpen, setUserPopupOpen] = useState(false);
  const [mobileUserPopupOpen, setMobileUserPopupOpen] = useState(false);
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
      {/* My Samples standalone link with separator */}
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

        {/* Empty div to keep title centered */}
        <div className="w-10" />
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

            {/* Nav Content */}
            <div className="p-3">
              <NavContent isMobile />
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
      <aside
        className={`hidden md:flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white py-5 transition-all duration-300 ease-in-out ${
          isOpen ? "w-[260px] px-3" : "w-16 px-2"
        }`}
      >
        {/* Header */}
        <div
          className={`flex shrink-0 items-center pb-6 ${
            isOpen ? "justify-between px-2" : "justify-center"
          }`}
        >
          {isOpen ? (
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
          ) : (
            <TooltipButton
              label="Open sidebar"
              onClick={onToggle}
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-100"
            >
              <Image
                src="https://images.useterra.com/logo/1766471182424-2upmie.webp"
                alt="Terra"
                width={28}
                height={28}
                className="h-7 w-7 object-contain transition-opacity duration-200 group-hover:opacity-0"
              />
              <PanelLeftOpen className="absolute h-5 w-5 text-slate-600 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
            </TooltipButton>
          )}

          {isOpen && (
            <span className="text-lg font-semibold text-slate-900">
              TerraForm
            </span>
          )}

          {isOpen && <div className="w-10" />}
        </div>

        {/* Scrollable content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {isOpen ? (
            <NavContent />
          ) : (
            // Collapsed view - icons only with tooltips
            <div className="flex flex-col items-center gap-1">
              {/* My Samples icon in collapsed view */}
              <Link href="/samples" className="relative">
                <TooltipButton
                  label={`My Samples${cartCount > 0 ? ` (${cartCount})` : ""}`}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                    pathname === "/samples"
                      ? "bg-orange-50 text-orange-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <ShoppingBag className="h-5 w-5" />
                </TooltipButton>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-semibold text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Separator */}
              <div className="my-2 w-8 border-t border-slate-200" />

              {/* Nav items */}
              {navItems.map((item: NavItem) => {
                const ItemIcon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                if (item.locked) {
                  return (
                    <TooltipButton
                      key={item.label}
                      label={item.lockedTooltip || `${item.label} (Locked)`}
                      className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-300 cursor-not-allowed"
                    >
                      <ItemIcon className="h-5 w-5" />
                      <Lock className="absolute -top-0.5 -right-0.5 h-3 w-3 text-slate-400" />
                    </TooltipButton>
                  );
                }

                return (
                  <Link key={item.label} href={item.href}>
                    <TooltipButton
                      label={item.label}
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                        isActive
                          ? "bg-orange-50 text-orange-600"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <ItemIcon className="h-5 w-5" />
                    </TooltipButton>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile section - fixed at bottom */}
        <div
          className={`relative shrink-0 border-t border-slate-100 pt-3 ${
            isOpen ? "" : "flex flex-col items-center"
          }`}
        >
          {/* User avatar */}
          {isOpen ? (
            <>
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
            </>
          ) : (
            <TooltipButton
              label={fullName}
              onClick={() => setUserPopupOpen(!userPopupOpen)}
              className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-slate-50"
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
            </TooltipButton>
          )}
        </div>
      </aside>
    </>
  );
}
