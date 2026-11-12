import React, { useState } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Plus, 
  Trash2, 
  Check, 
  Building2, 
  UserCheck, 
  Lock,
  Globe
} from 'lucide-react';
import { OrgAccessConfig, UserProfile, GroupMeta } from '../types';

interface OrgAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgConfig: OrgAccessConfig;
  onSaveOrgConfig: (config: OrgAccessConfig) => void;
  currentUser: UserProfile | null;
  groups: GroupMeta[];
  onAssignUserGroup: (groupId: number | undefined) => void;
}

export const OrgAuthModal: React.FC<OrgAuthModalProps> = ({
  isOpen,
  onClose,
  orgConfig,
  onSaveOrgConfig,
  currentUser,
  groups,
  onAssignUserGroup,
}) => {
  const [config, setConfig] = useState<OrgAccessConfig>(orgConfig);
  const [newDomain, setNewDomain] = useState('');
  const [newEmail, setNewEmail] = useState('');

  if (!isOpen) return null;

  const handleAddDomain = () => {
    const d = newDomain.trim().toLowerCase().replace(/^@/, '');
    if (!d || config.allowedDomains.includes(d)) return;
    const updated = {
      ...config,
      allowedDomains: [...config.allowedDomains, d],
    };
    setConfig(updated);
    onSaveOrgConfig(updated);
    setNewDomain('');
  };

  const handleRemoveDomain = (domain: string) => {
    const updated = {
      ...config,
      allowedDomains: config.allowedDomains.filter((d) => d !== domain),
    };
    setConfig(updated);
    onSaveOrgConfig(updated);
  };

  const handleAddEmail = () => {
    const e = newEmail.trim().toLowerCase();
    if (!e || config.allowedEmails.includes(e)) return;
    const updated = {
      ...config,
      allowedEmails: [...config.allowedEmails, e],
    };
    setConfig(updated);
    onSaveOrgConfig(updated);
    setNewEmail('');
  };

  const handleRemoveEmail = (email: string) => {
    const updated = {
      ...config,
      allowedEmails: config.allowedEmails.filter((e) => e !== email),
    };
    setConfig(updated);
    onSaveOrgConfig(updated);
  };

  const handleToggleEnforce = (enforced: boolean) => {
    const updated = {
      ...config,
      enforceDomainCheck: enforced,
    };
    setConfig(updated);
    onSaveOrgConfig(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                ตรวจสอบสิทธิ์อีเมลองค์กร (Organization Authorization)
              </h3>
              <p className="text-xs text-slate-500">
                จำกัดการเข้าถึงและกำหนดสิทธิ์การแก้ไขข้อมูลเฉพาะบุคลากรที่ได้รับอนุญาต
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xs px-2.5 py-1 rounded-lg"
          >
            ปิด
          </button>
        </div>

        {/* Current User Status Box */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
          <span className="text-xs font-bold text-slate-700 block">
            สถานะผู้ใช้งานปัจจุบัน:
          </span>
          {currentUser ? (
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div>
                <span className="font-semibold text-slate-800">{currentUser.displayName || 'ผู้ใช้'}</span>
                <span className="text-slate-500 ml-1.5 font-mono">({currentUser.email})</span>
              </div>
              <div className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>ยืนยันสิทธิ์สำเร็จ</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">
              ยังไม่ได้เข้าสู่ระบบ (คลิก "เข้าสู่ระบบด้วย Google" ที่มุมขวาบน)
            </div>
          )}

          {/* Group Assignment for user */}
          {currentUser && (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-slate-600">สังกัดกลุ่มประจำของผู้ใช้:</span>
              <select
                value={currentUser.assignedGroupId || ''}
                onChange={(e) =>
                  onAssignUserGroup(e.target.value ? Number(e.target.value) : undefined)
                }
                className="text-xs rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-medium"
              >
                <option value="">-- ไม่ระบุกลุ่ม (เข้าได้ทุกกลุ่ม) --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}: {g.agency}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Enforcement Toggle */}
        <div className="flex items-center justify-between p-3.5 bg-sky-50/60 rounded-2xl border border-sky-100">
          <div>
            <div className="font-semibold text-xs text-sky-950">
              บังคับตรวจสอบเฉพาะโดเมนองค์กรที่ระบุ
            </div>
            <div className="text-[11px] text-sky-800 mt-0.5">
              เมื่อเปิดใช้งาน บัญชีที่ไม่ได้อยู่ในโดเมนหรืออีเมลด้านล่างจะไม่สามารถเข้าแก้ไขข้อมูลได้
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.enforceDomainCheck}
              onChange={(e) => handleToggleEnforce(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-600"></div>
          </label>
        </div>

        {/* Allowed Domains Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-sky-600" />
              โดเมนองค์กรที่ได้รับอนุญาต (@domain):
            </label>
            <span className="text-[11px] text-slate-400">
              {config.allowedDomains.length} โดเมน
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddDomain();
              }}
              placeholder="เช่น moph.go.th หรือ go.th..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            />
            <button
              type="button"
              onClick={handleAddDomain}
              className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-medium transition-colors"
            >
              เพิ่มโดเมน
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
            {config.allowedDomains.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 text-xs rounded-xl font-mono border border-slate-200"
              >
                <span>@{domain}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveDomain(domain)}
                  className="text-slate-400 hover:text-rose-600 p-0.5 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Allowed Specific Emails List */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
              อีเมลรายบุคคลที่ได้รับสิทธิ์พิเศษ (Allowlist):
            </label>
            <span className="text-[11px] text-slate-400">
              {config.allowedEmails.length} อีเมล
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddEmail();
              }}
              placeholder="เช่น pearlstepm@gmail.com หรือ admin@health.org..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="button"
              onClick={handleAddEmail}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-medium transition-colors"
            >
              เพิ่มอีเมล
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
            {config.allowedEmails.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-800 text-xs rounded-xl font-mono border border-indigo-200/60"
              >
                <span>{email}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveEmail(email)}
                  className="text-indigo-400 hover:text-rose-600 p-0.5 rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition-colors"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};
