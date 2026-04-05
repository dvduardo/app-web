"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, FolderPlus, Sparkles, Shapes, FileText, Heart, Radio } from "lucide-react";
import { itemSchema, ItemFormInput } from "@/lib/schemas/item";
import { UploadablePhoto } from "@/lib/photo-upload";
import { PhotoUpload } from "./photo-upload";
import { ImageGalleryModal } from "@/app/components/ui/image-gallery-modal";
import type { CustomField } from "@/hooks/use-custom-fields";
import type { Category } from "@/hooks/use-categories";
import { itemStatusOptions } from "@/lib/item-status";

type ItemFormValues = z.input<typeof itemSchema>;
const EMPTY_PHOTOS: UploadablePhoto[] = [];

interface ItemFormProps {
  title: string;
  submitLabel: string;
  savingLabel: string;
  cancelLabel?: string;
  defaultValues?: Partial<ItemFormValues>;
  initialPhotos?: UploadablePhoto[];
  customFields: CustomField[];
  categories: Category[];
  error?: string;
  isSaving?: boolean;
  onSubmit: (values: ItemFormInput, photos: UploadablePhoto[]) => Promise<void>;
  onCreateCategory: (categoryName: string) => Promise<Category>;
  onAddCustomField: (fieldName: string, fieldType: string) => Promise<void>;
  onRemoveCustomField: (fieldId: string, fieldName: string) => Promise<void>;
}

export function ItemForm({
  title,
  submitLabel,
  savingLabel,
  cancelLabel = "Cancelar",
  defaultValues,
  initialPhotos = EMPTY_PHOTOS,
  customFields,
  categories,
  error = "",
  isSaving = false,
  onSubmit,
  onCreateCategory,
  onAddCustomField,
  onRemoveCustomField,
}: ItemFormProps) {
  const [formError, setFormError] = useState("");
  const [photos, setPhotos] = useState<UploadablePhoto[]>(() => initialPhotos);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("text");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    getValues,
    control,
  } = useForm<ItemFormValues, unknown, ItemFormInput>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      categoryId: defaultValues?.categoryId ?? "",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      status: defaultValues?.status ?? "owned",
      isFavorite: defaultValues?.isFavorite ?? false,
      customData: defaultValues?.customData ?? {},
    },
  });

  useEffect(() => {
    reset({
      categoryId: defaultValues?.categoryId ?? "",
      title: defaultValues?.title ?? "",
      description: defaultValues?.description ?? "",
      status: defaultValues?.status ?? "owned",
      isFavorite: defaultValues?.isFavorite ?? false,
      customData: defaultValues?.customData ?? {},
    });
  }, [defaultValues, reset]);

  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const displayedError = formError || error;
  const categoryField = register("categoryId");
  const statusField = register("status");
  const favoriteField = register("isFavorite");
  const selectedCategoryId = useWatch({ control, name: "categoryId" }) ?? "";
  const selectedStatus = useWatch({ control, name: "status" }) ?? "owned";
  const isFavorite = useWatch({ control, name: "isFavorite" }) ?? false;
  const customDataValues =
    (useWatch({ control, name: "customData" }) as Record<string, string> | undefined) ?? {};
  const isEditing = title.toLowerCase().includes("editar");
  const inputClassName =
    "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 focus:outline-none";

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setFormError("Nome da categoria é obrigatório");
      return;
    }

    try {
      setIsCreatingCategory(true);
      const createdCategory = await onCreateCategory(newCategoryName);
      setValue("categoryId", createdCategory.id, { shouldDirty: true, shouldValidate: true });
      setNewCategoryName("");
      setFormError("");
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "Erro ao criar categoria"
      );
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleAddField = async () => {
    if (!newFieldName.trim()) {
      setFormError("Nome do campo é obrigatório");
      return;
    }

    try {
      await onAddCustomField(newFieldName, newFieldType);
      const currentCustomData =
        (getValues("customData") as Record<string, string> | undefined) ?? {};
      setValue("customData", {
        ...currentCustomData,
        [newFieldName]: "",
      });
      setNewFieldName("");
      setNewFieldType("text");
      setFormError("");
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "Erro ao adicionar campo"
      );
    }
  };

  const handleRemoveField = async (fieldId: string, fieldName: string) => {
    if (!confirm(`Deseja remover o campo "${fieldName}"?`)) {
      return;
    }

    try {
      await onRemoveCustomField(fieldId, fieldName);
      const currentCustomData: Record<string, string> = {
        ...(((getValues("customData") as Record<string, string> | undefined) ?? {})),
      };
      delete currentCustomData[fieldName];
      setValue("customData", currentCustomData);
    } catch (submitError) {
      setFormError(
        submitError instanceof Error ? submitError.message : "Erro ao remover campo"
      );
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-white/20 bg-white/10 p-5 text-white shadow-2xl backdrop-blur-xl sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
              <Sparkles className="h-3.5 w-3.5" />
              {isEditing ? "Ajuste os detalhes do item" : "Crie um novo item para sua coleção"}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-white/75 sm:text-base">
              Organize categoria, descrição, fotos e campos extras em uma experiência mais confortável no mobile.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 self-start rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </section>

      {displayedError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{displayedError}</p>
        </div>
      )}

      <form
        onSubmit={handleSubmit(async (values) => {
          setFormError("");
          await onSubmit(values, photos);
        })}
        className="space-y-5"
      >
        <input type="hidden" {...statusField} value={selectedStatus} />
        <input
          type="hidden"
          {...favoriteField}
          value={isFavorite ? "true" : "false"}
        />

        <section className="rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-4 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FolderPlus className="h-4 w-4" />
            Categoria
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
            <div>
              <label
                htmlFor="categoryId"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Categoria *
              </label>
              <select
                id="categoryId"
                className={`${inputClassName} ${
                  errors.categoryId ? "border-red-400" : "border-slate-200"
                }`}
                value={selectedCategoryId}
                onChange={(event) =>
                  setValue("categoryId", event.target.value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                name={categoryField.name}
                ref={categoryField.ref}
                onBlur={categoryField.onBlur}
              >
                <option value="">Selecione uma categoria</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-600">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-4">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Nova categoria
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(event) => setNewCategoryName(event.target.value)}
                  className={`${inputClassName} flex-1`}
                  placeholder="Ex: Livros"
                />
                <button
                  type="button"
                  disabled={isCreatingCategory}
                  onClick={() => void handleCreateCategory()}
                  className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isCreatingCategory ? "Criando..." : "Criar"}
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Ao criar, ela já fica selecionada para este item.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-4 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FileText className="h-4 w-4" />
            Informacoes principais
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-2 block text-sm font-medium text-slate-700">
                Titulo *
              </label>
              <input
                id="title"
                type="text"
                placeholder="Ex: Harry Potter"
                className={`${inputClassName} ${
                  errors.title ? "border-red-400" : "border-slate-200"
                }`}
                {...register("title")}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-700">
                Descricao
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Descricao do item"
                className={inputClassName}
                {...register("description")}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)]">
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Radio className="h-4 w-4" />
                  Status do item
                </div>
                <div className="grid gap-2">
                  {itemStatusOptions.map((option) => {
                    const isActive = selectedStatus === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          setValue("status", option.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          isActive
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <div className="text-sm font-semibold">{option.label}</div>
                        <div className={`mt-1 text-xs ${isActive ? "text-white/75" : "text-slate-500"}`}>
                          {option.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Heart className="h-4 w-4" />
                  Destaque na colecao
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isFavorite}
                  onClick={() =>
                    setValue("isFavorite", !isFavorite, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    isFavorite
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="text-sm font-semibold">
                      {isFavorite ? "Marcado como favorito" : "Marcar como favorito"}
                    </div>
                    <div className={`mt-1 text-xs ${isFavorite ? "text-rose-600" : "text-slate-500"}`}>
                      Use isso para destacar pecas queridas e raridades.
                    </div>
                  </div>
                  <div
                    className={`flex h-7 w-12 items-center rounded-full p-1 transition ${
                      isFavorite ? "bg-rose-500" : "bg-slate-300"
                    }`}
                  >
                    <div
                      className={`h-5 w-5 rounded-full bg-white transition ${
                        isFavorite ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        <PhotoUpload
          photos={photos}
          disabled={isSaving}
          onChange={setPhotos}
          onError={setFormError}
          onRemove={async (photo, index) => {
            await Promise.resolve();
            setPhotos((currentPhotos) =>
              currentPhotos.filter((_, photoIndex) => photoIndex !== index)
            );
            if (photo.id && galleryOpen && photos.length === 1) {
              setGalleryOpen(false);
            }
          }}
          onPreview={(index) => {
            setGalleryInitialIndex(index);
            setGalleryOpen(true);
          }}
        />

        {customFields.length > 0 && (
          <section className="rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-4 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">
              Campos customizados
            </h3>
            <div className="space-y-4">
              {customFields.map((field) => (
                <div
                  key={field.id}
                  className="rounded-[1.25rem] border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <label
                      htmlFor={field.fieldName}
                      className="block text-sm font-medium text-slate-700"
                    >
                      {field.fieldName}
                    </label>
                    <button
                      type="button"
                      onClick={() => void handleRemoveField(field.id, field.fieldName)}
                      className="self-start rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-200"
                    >
                      Remover
                    </button>
                  </div>
                  {field.fieldType === "textarea" ? (
                    <textarea
                      id={field.fieldName}
                      rows={2}
                      className={inputClassName}
                      value={customDataValues[field.fieldName] ?? ""}
                      onChange={(event) =>
                        setValue(
                          "customData",
                          {
                            ...customDataValues,
                            [field.fieldName]: event.target.value,
                          },
                          { shouldDirty: true }
                        )
                      }
                    />
                  ) : (
                    <input
                      id={field.fieldName}
                      type={field.fieldType === "select" ? "text" : field.fieldType}
                      className={inputClassName}
                      value={customDataValues[field.fieldName] ?? ""}
                      onChange={(event) =>
                        setValue(
                          "customData",
                          {
                            ...customDataValues,
                            [field.fieldName]: event.target.value,
                          },
                          { shouldDirty: true }
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[1.75rem] border border-slate-200/70 bg-white/85 p-4 shadow-[0_16px_45px_-32px_rgba(15,23,42,0.35)] backdrop-blur sm:p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Shapes className="h-4 w-4" />
            Adicionar campo customizado
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Nome do Campo
              </label>
              <input
                type="text"
                value={newFieldName}
                onChange={(event) => setNewFieldName(event.target.value)}
                className={inputClassName}
                placeholder="Ex: Data de Leitura"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Tipo
              </label>
              <select
                value={newFieldType}
                onChange={(event) => setNewFieldType(event.target.value)}
                className={inputClassName}
              >
                <option value="text">Texto</option>
                <option value="textarea">Texto longo</option>
                <option value="number">Número</option>
                <option value="date">Data</option>
              </select>
            </div>
            <button
              type="button"
              onClick={() => void handleAddField()}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              + Adicionar Campo
            </button>
          </div>
        </section>

        <div className="sticky bottom-3 z-20 rounded-[1.5rem] border border-white/60 bg-white/90 p-3 shadow-[0_18px_50px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white transition hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            {isSaving ? savingLabel : submitLabel}
          </button>
          <Link
            href="/dashboard"
            className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-center font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {cancelLabel}
          </Link>
          </div>
        </div>
      </form>

      <ImageGalleryModal
        isOpen={galleryOpen}
        photos={photos}
        initialIndex={galleryInitialIndex}
        onClose={() => setGalleryOpen(false)}
      />
    </div>
  );
}
