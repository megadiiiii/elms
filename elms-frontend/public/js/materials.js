function setupMaterialsPage() {
    return {
        showUploadModal: false,
        showMsg: false,
        showConfirm: false,
        message: '',
        type: 'success',
        deleteData: { id: null, courseId: null },
        fileInfo: { name: '', size: '' },

        openConfirm(id, courseId) {
            this.deleteData = { id, courseId };
            this.showConfirm = true;
        },

        handleFileChange(e) {
            const file = e.target.files[0];
            if (file) {
                this.fileInfo.name = file.name;
                this.fileInfo.size = (file.size / 1024).toFixed(1) + ' KB';
            }
        },

        init() {
            const el = document.querySelector('[data-success]');
            if (!el) return;
            const s = el.dataset.success;
            const e = el.dataset.error;
            if (s && s !== 'null' && s !== '') {
                this.message = s;
                this.type = 'success';
                this.showMsg = true;
            } else if (e && e !== 'null' && e !== '') {
                this.message = e;
                this.type = 'error';
                this.showMsg = true;
            }
        }
    }
}
