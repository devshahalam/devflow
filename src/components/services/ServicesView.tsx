import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, DollarSign, X, Check, ArrowRight } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { Service } from '../../types/crm';

export const ServicesView: React.FC = () => {
  const {
    services,
    leads,
    projects,
    addService,
    updateService,
    deleteService,
    formatCurrency,
    profile,
    setCurrentTab,
    currentUser,
  } = useCRM();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Full Website');
  const [defaultPrice, setDefaultPrice] = useState<number>(850);
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingServiceId(null);
    setName('');
    setCategory('Full Website');
    setDefaultPrice(850);
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: Service) => {
    setEditingServiceId(srv.id);
    setName(srv.name);
    setCategory(srv.category);
    setDefaultPrice(srv.defaultPrice);
    setDescription(srv.description);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingServiceId) {
      updateService(editingServiceId, {
        name: name.trim(),
        category: category.trim(),
        defaultPrice: Number(defaultPrice) || 0,
        description: description.trim(),
      });
    } else {
      addService({
        name: name.trim(),
        category: category.trim(),
        defaultPrice: Number(defaultPrice) || 0,
        description: description.trim(),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Web Development Services & Packages
          </h2>
          <p className="text-xs text-slate-500">
            Define your core freelance offerings, baseline rates, and packaging terms.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ Add Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((srv) => {
          const matchingLeads = leads.filter(
            (l) => l.serviceId === srv.id || l.serviceName === srv.name
          );
          const wonLeads = matchingLeads.filter((l) => l.status === 'Won');
          const matchingProjects = projects.filter(
            (p) => p.serviceId === srv.id || p.serviceName === srv.name
          );
          const totalRev = matchingProjects.reduce((sum, p) => sum + p.projectValue, 0);

          return (
            <div
              key={srv.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                    {srv.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="rounded p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors"
                      title="Edit Service"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    {currentUser?.role === 'Owner' && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete service "${srv.name}"?`)) {
                            deleteService(srv.id);
                          }
                        }}
                        className="rounded p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Service (Owner only)"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="mt-2 text-base font-bold text-slate-900">{srv.name}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Starting Rate:
                    </span>
                    <span className="text-lg font-bold text-slate-900">
                      {formatCurrency(srv.defaultPrice)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Total Billed:
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      {formatCurrency(totalRev)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span>{matchingLeads.length} total inquiries</span>
                  <span className="font-semibold text-emerald-700">
                    {wonLeads.length} deals closed
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingServiceId ? 'Edit Service Offering' : 'Add New Service Offering'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Service Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WooCommerce Customization"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. E-Commerce"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Default Price ({profile.defaultCurrency || 'USD'})
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                    value={defaultPrice}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Deliverables & Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What is included in this package..."
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700"
                >
                  {editingServiceId ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
