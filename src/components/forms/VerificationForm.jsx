"use client";

import React, { useState, useEffect } from "react";
import { useAuth, UserRoleEnum } from "@/context/AuthContext";
import verificationService from "@/services/verificationService";
import styles from "@/styles/profile/VerificationForm.module.css";

const VerificationForm = ({ profile }) => {
  const { user, role } = useAuth();
  const isCharity = role === "Charity" || user?.accountType === UserRoleEnum.CHARITY;
  const verificationState = user?.verificationState ?? 0;

  // 0: Pending, 1: InReview, 2: Verified, 3: Rejected
  const isLocked = verificationState !== 0;

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  
  const [formData, setFormData] = useState({});
  const [files, setFiles] = useState({});

  // Initialize data from profile if available
  useEffect(() => {
    if (profile) {
      const details = isCharity ? profile.charityDetails : profile.donorDetails;
      if (details) {
        // Map details to formData (handling camelCase from API to PascalCase for submit)
        if (isCharity) {
          setFormData({
            RegistrationNumber: details.registrationNumber || "",
            RegistrationDate: details.registrationDate ? details.registrationDate.split("T")[0] : "",
            HeadquartersAddress: details.headquartersAddress || "",
            AuthorizedPersonName: details.authorizedPersonName || "",
            AuthorizedPersonPosition: details.authorizedPersonPosition || "",
          });
        } else {
          setFormData({
            CommercialRegistrationNumber: details.commercialRegistrationNumber || "",
            CommercialRegistrationDate: details.commercialRegistrationDate ? details.commercialRegistrationDate.split("T")[0] : "",
            TaxNumber: details.taxNumber || "",
            BusinessLicenseNumber: details.businessLicenseNumber || "",
            HeadquartersAddress: details.headquartersAddress || "",
          });
        }
      }
    }
  }, [profile, isCharity]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles?.[0]) {
      const file = selectedFiles[0];
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ text: "حجم الملف يجب أن يكون أقل من 5 ميجابايت", type: "error" });
        return;
      }
      if (file.type !== "application/pdf") {
        setMessage({ text: "يجب أن يكون الملف بصيغة PDF فقط", type: "error" });
        return;
      }
      setFiles((prev) => ({ ...prev, [name]: file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const data = new FormData();
      
      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) data.append(key, value);
      });

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        data.append(key, file);
      });

      if (isCharity) {
        await verificationService.submitCharityVerification(data);
      } else {
        await verificationService.submitDonorVerification(data);
      }

      setMessage({ text: "تم تقديم بيانات التوثيق بنجاح! سيتم مراجعتها من قبل الإدارة.", type: "success" });
      
      // Force reload user state after a short delay to update verificationState
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("Verification submission error:", error);
      setMessage({ 
        text: error.response?.data?.message || "حدث خطأ أثناء تقديم البيانات. يرجى المحاولة مرة أخرى.", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusHeader = () => {
    switch (verificationState) {
      case 1:
        return (
          <div className={`${styles.statusBadge} ${styles.inReview}`}>
            <i className="fa-solid fa-magnifying-glass"></i>
            <span>بياناتك قيد المراجعة حالياً. لا يمكنك التعديل في هذه المرحلة.</span>
          </div>
        );
      case 2:
        return (
          <div className={`${styles.statusBadge} ${styles.verified}`}>
            <i className="fa-solid fa-circle-check"></i>
            <span>حسابك موثق بالكامل. شكراً لثقتكم.</span>
          </div>
        );
      case 3:
        return (
          <div className={`${styles.statusBadge} ${styles.rejected}`}>
            <i className="fa-solid fa-circle-xmark"></i>
            <span>تم رفض طلب التوثيق. يمكنك تعديل البيانات وإعادة التقديم إذا سمحت الإدارة بذلك (حالة الحساب معلقة).</span>
          </div>
        );
      default:
        return (
          <div className={`${styles.statusBadge} ${styles.pending}`}>
            <i className="fa-solid fa-circle-info"></i>
            <span>يرجى إكمال بيانات التوثيق لتمكين كافة مميزات المنصة.</span>
          </div>
        );
    }
  };

  const renderCharityFields = () => {
    const details = profile?.charityDetails || {};
    return (
      <>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label>رقم التسجيل</label>
            <input 
              type="text" 
              name="RegistrationNumber" 
              placeholder="مثال: 12345" 
              value={formData.RegistrationNumber || ""}
              onChange={handleInputChange} 
              disabled={isLocked}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>تاريخ التسجيل</label>
            <input 
              type="date" 
              name="RegistrationDate" 
              value={formData.RegistrationDate || ""}
              onChange={handleInputChange} 
              disabled={isLocked}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>عنوان المقر الرئيسي</label>
            <input 
              type="text" 
              name="HeadquartersAddress" 
              placeholder="العنوان التفصيلي للمقر" 
              value={formData.HeadquartersAddress || ""}
              onChange={handleInputChange} 
              disabled={isLocked}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>اسم الشخص المفوض</label>
            <input 
              type="text" 
              name="AuthorizedPersonName" 
              placeholder="الاسم الثلاثي" 
              value={formData.AuthorizedPersonName || ""}
              onChange={handleInputChange} 
              disabled={isLocked}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>منصب الشخص المفوض</label>
            <input 
              type="text" 
              name="AuthorizedPersonPosition" 
              placeholder="مثال: رئيس مجلس الإدارة" 
              value={formData.AuthorizedPersonPosition || ""}
              onChange={handleInputChange} 
              disabled={isLocked}
            />
          </div>
        </div>

        <div className={styles.fileSection}>
          <h4 className={styles.title} style={{ fontSize: '1.1rem' }}>المستندات المطلوبة (صيغة PDF)</h4>
          <div className={styles.fileGrid}>
            <FileField name="RegistrationCertificate" label="شهادة التسجيل" onChange={handleFileChange} disabled={isLocked} currentFile={files.RegistrationCertificate} existingUrl={details.registrationCertificateUrl} />
            <FileField name="Bylaws" label="لائحة النظام الأساسي" onChange={handleFileChange} disabled={isLocked} currentFile={files.Bylaws} existingUrl={details.bylawsUrl} />
            <FileField name="FoundersList" label="قائمة المؤسسين" onChange={handleFileChange} disabled={isLocked} currentFile={files.FoundersList} existingUrl={details.foundersListUrl} />
            <FileField name="BoardMembersList" label="قائمة أعضاء مجلس الإدارة" onChange={handleFileChange} disabled={isLocked} currentFile={files.BoardMembersList} existingUrl={details.boardMembersListUrl} />
            <FileField name="HeadquartersProof" label="إثبات المقر (عقد ملكية/إيجار)" onChange={handleFileChange} disabled={isLocked} currentFile={files.HeadquartersProof} existingUrl={details.headquartersProofUrl} />
            <FileField name="DelegationDocument" label="وثيقة التفويض" onChange={handleFileChange} disabled={isLocked} currentFile={files.DelegationDocument} existingUrl={details.delegationDocumentUrl} />
          </div>
        </div>
      </>
    );
  };

  const renderDonorFields = () => {
    const details = profile?.donorDetails || {};
    return (
      <>
        <div className={styles.formGrid}>
          <div className={styles.inputGroup}>
            <label>رقم السجل التجاري</label>
            <input 
              type="text" 
              name="CommercialRegistrationNumber" 
              placeholder="رقم السجل" 
              value={formData.CommercialRegistrationNumber || ""}
              onChange={handleInputChange} 
              disabled={isLocked}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>تاريخ السجل التجاري</label>
            <input 
              type="date" 
              name="CommercialRegistrationDate" 
              value={formData.CommercialRegistrationDate || ""}
              onChange={handleInputChange} 
              disabled={isLocked}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>الرقم الضريبي</label>
            <input 
              type="text" 
              name="TaxNumber" 
              placeholder="رقم البطاقة الضريبية" 
              value={formData.TaxNumber || ""}
              onChange={handleInputChange} 
              disabled={isLocked}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>رقم رخصة العمل</label>
            <input 
              type="text" 
              name="BusinessLicenseNumber" 
              placeholder="رقم الترخيص" 
              value={formData.BusinessLicenseNumber || ""}
              onChange={handleInputChange} 
              disabled={isLocked}
            />
          </div>
          <div className={styles.inputGroup}>
            <label>عنوان المقر الرئيسي</label>
            <input 
              type="text" 
              name="HeadquartersAddress" 
              placeholder="العنوان التفصيلي للمقر" 
              value={formData.HeadquartersAddress || ""}
              onChange={handleInputChange} 
              disabled={isLocked}
            />
          </div>
        </div>

        <div className={styles.fileSection}>
          <h4 className={styles.title} style={{ fontSize: '1.1rem' }}>المستندات المطلوبة (صيغة PDF)</h4>
          <div className={styles.fileGrid}>
            <FileField name="CommercialRegister" label="السجل التجاري" onChange={handleFileChange} disabled={isLocked} currentFile={files.CommercialRegister} existingUrl={details.commercialRegisterUrl} />
            <FileField name="TaxCard" label="البطاقة الضريبية" onChange={handleFileChange} disabled={isLocked} currentFile={files.TaxCard} existingUrl={details.taxCardUrl} />
            <FileField name="BusinessLicense" label="رخصة العمل" onChange={handleFileChange} disabled={isLocked} currentFile={files.BusinessLicense} existingUrl={details.businessLicenseUrl} />
            <FileField name="CivilProtectionApproval" label="موافقة الحماية المدنية" onChange={handleFileChange} disabled={isLocked} currentFile={files.CivilProtectionApproval} existingUrl={details.civilProtectionApprovalUrl} />
            <FileField name="EnvironmentalApproval" label="الموافقة البيئية" onChange={handleFileChange} disabled={isLocked} currentFile={files.EnvironmentalApproval} existingUrl={details.environmentalApprovalUrl} />
            <FileField name="OwnershipContract" label="عقد الملكية" onChange={handleFileChange} disabled={isLocked} currentFile={files.OwnershipContract} existingUrl={details.ownershipContractUrl} />
          </div>
        </div>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        <i className="fa-solid fa-shield-halved"></i>
        توثيق الحساب والمؤسسة
      </h3>

      {renderStatusHeader()}

      {message.text && (
        <div className={`${styles.statusBadge} ${message.type === 'error' ? styles.rejected : styles.verified}`} style={{ marginBottom: '1rem' }}>
          <i className={`fa-solid ${message.type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}`}></i>
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className={isLocked ? styles.lockedOverlay : ""}>
        {isLocked && <div className={styles.lockedIcon}><i className="fa-solid fa-lock"></i></div>}
        
        {isCharity ? renderCharityFields() : renderDonorFields()}

        {!isLocked && (
          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin"></i>
                جاري الإرسال...
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane"></i>
                تحديث بيانات التوثيق
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
};

const FileField = ({ name, label, onChange, disabled, currentFile, existingUrl }) => (
  <div className={styles.inputGroup}>
    <label>{label}</label>
    <div className={`${styles.fileInput} ${currentFile ? styles.active : (existingUrl ? styles.hasExisting : "")}`}>
      <i className={currentFile ? "fa-solid fa-file-pdf" : (existingUrl ? "fa-solid fa-check-double" : "fa-solid fa-cloud-arrow-up")}></i>
      <span className={styles.fileName}>
        {currentFile ? currentFile.name : (existingUrl ? "تم إرفاق ملف مسبقاً" : "اختر ملف PDF")}
      </span>
      <input 
        type="file" 
        name={name} 
        accept=".pdf" 
        onChange={onChange} 
        disabled={disabled}
      />
    </div>
    {existingUrl && (
      <a href={existingUrl} target="_blank" rel="noopener noreferrer" className={styles.viewLink}>
        <i className="fa-solid fa-eye"></i> عرض الملف الحالي
      </a>
    )}
  </div>
);

export default VerificationForm;
